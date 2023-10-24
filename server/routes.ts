import { ObjectId } from "mongodb";

import { Router } from "./framework/router";

import { AIAssistant, Follow, Post, SmartCollection, SmartFeed, SmartSearch, User, WebSession } from "./app";
import { PostDoc } from "./concepts/post";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import { getExpressRouter } from "./framework/router";

import { assignSmartCollection, evaluatePostContent, getDailyContent, getFeedFilters, getSearchTags, getSmartTags } from "./gptHelpers";
import Responses from "./responses";

interface dailyContent {
  learningPosts: string;
  dailyMessage: string;
}

class Routes {
  /**
   * User
   */
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, fullname: string, bio: string, username: string, password: string, picture: string) {
    WebSession.isLoggedOut(session);
    //also creating feed for this user
    const user = await User.create(fullname, bio, username, password, picture);
    if (user.user) {
      //as soon as user is created we create an empty smart feed for it
      await SmartFeed.createSmartFeed(user.user._id);
      //creating AI assistant for new user
      await AIAssistant.createAIAssistant(user.user._id);
      return user;
    } else {
      return "User creation failed";
    }
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  /**
   * Post
   */

  @Router.get("/posts")
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
    } else {
      posts = await Post.getPosts({});
    }
    return await Responses.posts(posts);
  }

  //standard controller for handling user creating new post
  @Router.post("/posts")
  async createPost(session: WebSessionDoc, content: string) {
    const user = WebSession.getUser(session);
    //getting tags using gpt-4
    const isEducational = await evaluatePostContent(content);
    //checking if the content of the post is educational

    if (isEducational) {
      //if so, proceeding with getting the tags
      const tags = await getSmartTags(content);
      const createdPost = await Post.create(user, content, tags);

      //getting all the exists smart collections (their topics)
      const smartCollections = await SmartCollection.getAllSmartCollections();
      const smartCollectionsNames = smartCollections.map((collec) => collec.collectionTopic);

      //getting GPT to assign the collectio to the user input
      const response = await assignSmartCollection(smartCollectionsNames, content);

      if (createdPost.post && response) {
        if (response.isNewTopic) {
          //creating new smart collection
          await SmartCollection.create(response.topic, tags, response.topic.replace(/\s+/g, "_").toLowerCase(), []);
        }
        //getting colleciton id by the topic name
        const collectionId = await SmartCollection.getCollectionIdbyTopic(response.topic);
        //adding post to the smart collection
        const smartCollections = await SmartCollection.addPostToCollection(collectionId._id, createdPost.post._id);

        return { msg: createdPost.msg, post: await Responses.post(createdPost.post), tags: tags, smartCollections: smartCollections };
      }
    } else {
      return { msg: "post is not educational. rewrite it" };
    }
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    //checking if the text in the update is educational
    if (update.content) {
      const isEducational = await evaluatePostContent(update.content);
      if (isEducational) {
        const tags = await getSmartTags(update.content);
        update.tags = tags;
        return await Post.update(_id, update);
      } else {
        return { msg: "Updated post contains no educational content. Please edit the post and try again. " };
      }
    }
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return Post.delete(_id);
  }

  /**
   * Follow
   */

  @Router.post("/follow/:username")
  async followUser(session: WebSessionDoc, username: string) {
    const followerid = WebSession.getUser(session);
    const followeeid = await User.getUserByUsername(username);
    await User.userExists(followeeid._id);
    return await Follow.follow(followerid, followeeid._id, "user");
  }

  @Router.delete("/unfollow/:username")
  async unfollowUser(session: WebSessionDoc, username: string) {
    const followerid = WebSession.getUser(session);
    const followeeid = await User.getUserByUsername(username);
    await User.userExists(followeeid._id);
    return await Follow.unfollow(followerid, followeeid._id, "user");
  }

  @Router.get("/following/:username/:type")
  async getUserFollowingById(username: string, type: string) {
    const user = await User.getUserByUsername(username);
    await User.userExists(user._id);
    return await Follow.getAllFollowing(user._id, type);
  }

  @Router.get("/followers/:username/:type")
  async getUserFollowersById(username: string, type: string) {
    const user = await User.getUserByUsername(username);
    await User.userExists(user._id);
    return await Follow.getAllFollowers(user._id, type);
  }

  /**
   * Smart Collection
   */

  //create a collection
  @Router.post("/smartcollection/create")
  async createSmartCollection(topic: string, collectionname: string, tags: string[], posts: ObjectId[]) {
    return await SmartCollection.create(topic, tags, collectionname, posts);
  }

  // Get a specific SmartCollection by ID.
  @Router.get("/smartcollection/:collectionname")
  async getSmartCollectionById(collectionname: string) {
    const smartCollection = await SmartCollection.getByName(collectionname);

    const postsIds = (await SmartCollection.getPostsByName(collectionname)).posts;

    if (postsIds) {
      const posts = await Post.getPostsById(postsIds);
      return { msg: "collection retrived", smartCollection: smartCollection.smartCollection, posts: await Responses.posts(posts) };
    } else {
      return { msg: `Couldn't retrive posts of the ${collectionname} collection` };
    }
  }

  @Router.post("/smartcollection/follow/:collectionname")
  async followSmartCollection(session: WebSessionDoc, collectionname: string) {
    const followerId = WebSession.getUser(session);
    await SmartCollection.collectionExistsByName(collectionname);
    const smartCollection = await SmartCollection.getCollectionIdbyName(collectionname);
    return await Follow.follow(followerId, smartCollection._id, "collection");
  }

  @Router.delete("/smartcollection/unfollow/:collectionname")
  async unfollowSmartCollection(session: WebSessionDoc, collectionname: string) {
    const followerId = WebSession.getUser(session);
    await SmartCollection.collectionExistsByName(collectionname);
    const smartCollection = await SmartCollection.getCollectionIdbyName(collectionname);
    return await Follow.unfollow(followerId, smartCollection._id, "collection");
  }

  @Router.get("/smartcollections/all")
  async getAllSmartCollections() {
    return await SmartCollection.getAllSmartCollections();
  }

  //smartcollections that user follows
  @Router.get("/smartcollection/following/:username")
  async getUserFollowingSmartCollections(username: string) {
    console.log("username", username);
    const user = await User.getUserByUsername(username);
    const collectionIds = await Follow.getAllFollowing(user._id, "collection");
    return await SmartCollection.getUserFollowingSmartCollections(collectionIds);
  }
  /**
   * Smart Feed
   */

  @Router.get("/smartfeed")
  async getSmartFeed(session: WebSessionDoc) {
    //simply return all the posts in the users feed
    const userId = WebSession.getUser(session);
    const followingsIds = await Follow.getAllFollowing(userId, "user");
    //sending the posts to the Smart Feed to get ids of posts filtered according to the current filter
    const { allPosts, postsIdandTags } = await Post.getAllPostsOfFollowings(followingsIds);
    const filteredPostsIds = await SmartFeed.getPosts(userId, postsIdandTags);
    const filteredFeed = allPosts.filter((post) => filteredPostsIds.includes(post._id));
    const sortedFilteredFeed = filteredFeed.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return await Responses.posts(sortedFilteredFeed);
  }

  //update filters and return set of posts based on those filters
  @Router.post("/smartfeed/update")
  async updateSmartFeed(session: WebSessionDoc, userQuery: string) {
    //getting all the tags from the posts in the user's feed

    console.log("query", userQuery);
    const userId = WebSession.getUser(session);
    const followingsIds = await Follow.getAllFollowing(userId, "user");
    const { allPosts, postsIdandTags } = await Post.getAllPostsOfFollowings(followingsIds);

    //calling GPT to get filters from user query which are a collection of tags
    const allTags = [...new Set(postsIdandTags.flatMap((post) => post.tags))];
    const feedFilterTags = await getFeedFilters(userQuery, allTags);
    await SmartFeed.updateSmartFilters(userId, feedFilterTags);

    //getting updated filtered feed and returning it back
    const filteredPostsIds = await SmartFeed.getPosts(userId, postsIdandTags);
    const filteredFeed = allPosts.filter((post) => filteredPostsIds.includes(post._id));
    const sortedFilteredFeed = filteredFeed.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return await Responses.posts(sortedFilteredFeed);
  }

  //update filters and return set of posts based on those filters
  @Router.post("/smartfeed/reset")
  async resetSmartFeed(session: WebSessionDoc) {
    const userId = WebSession.getUser(session);
    return await SmartFeed.updateSmartFilters(userId, []);
  }

  /**
   * AI Assistant
   */
  @Router.post("/aiassistant/setgoal")
  async setWeeklyLearningCycle(session: WebSessionDoc, goal: string) {
    const userId = WebSession.getUser(session);

    const dailyContent = await getDailyContent(goal);
    const currentDate = new Date();

    // Assign a date to each content item
    const dailyContentWithDates = dailyContent.map((content: dailyContent) => {
      const contentWithDate = {
        ...content,
        date: new Date(currentDate),
      };
      currentDate.setDate(currentDate.getDate() + 1);
      return contentWithDate;
    });
    return await AIAssistant.setWeeklyLearningCycle(userId, goal, currentDate, dailyContentWithDates);
  }

  @Router.get("/aiassistant")
  async getAIAssistant(session: WebSessionDoc) {
    const userId = WebSession.getUser(session);
    return await AIAssistant.getAIAssistantByUserID(userId);
  }

  /**
   * Smart Search
   */

  @Router.post("/search/:username")
  async searchUserPosts(session: WebSessionDoc, username: string, userQuery: string) {
    const userId = WebSession.getUser(session);
    const searchedUser = await User.getUserByUsername(username);

    //getting all the post ids and their tags of a user being searched
    const searchedUserPosts = await Post.getByAuthor(searchedUser._id);
    const postsIdandTags = searchedUserPosts.map((post) => ({ postId: post._id, tags: post.tags }));

    //getting a set of all tags user's posts have
    const allTags = [...new Set(postsIdandTags.flatMap((post) => post.tags))];

    //turning user query to a set of search tags using GPT-4
    const tagsToFind = await getSearchTags(allTags, userQuery);

    //calling search action
    const resultsPostIds = await SmartSearch.search(userId, searchedUser._id, userQuery, postsIdandTags, tagsToFind);

    const results = await Promise.all(
      resultsPostIds.map(async (id) => {
        return await Post.getPostById(id);
      }),
    );

    return results;
  }

  @Router.get("/search/history")
  async getSearchHistory(session: WebSessionDoc) {
    const userId = WebSession.getUser(session);
    return await SmartSearch.getSearchHistoryByUserId(userId);
  }
}

export default getExpressRouter(new Routes());
