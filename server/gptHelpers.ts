import OpenAI from "openai";

const openai = new OpenAI();

export async function getSmartTags(content: string) {
  const functions = [
    {
      name: "validate_tags",
      description: `This function accepts 3 tags generated to best suit the user's input posts text and validates if they correspond to the text. Your job is to 
        populate the three_tags array with 3 tags you decided describe the text submitted by user best.`,
      parameters: {
        type: "object",
        properties: {
          tags: {
            type: "array",
            items: {
              name: "three_tags",
              type: "string",
              description: "A single tag that characterizes the content of text written by user. Prioritize concise tag names (1-3 words)",
            },
            description: "Array with three tags that describe the text submitted by user the best. Fill out this array with three tags that you think are most suitable for the text written by user",
          },
        },
        required: ["tags"],
      },
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `## Instruction ## You are smart content analyzer bot that analyzes text of posts written
         by user and create a list of 3 tags that best descibe the topics mentioned in the text submitted by user.
         Your job after generating these 3 tags is to populate a validate_tags function with these three tags. validate_tags
         accepts single argument, which is an array of strings. You should always submit 3 most relevant tags to the post as separate
         strings in this array. Prioritize tags with fewer words (up to 3). ## Example Input ## User's post: 'CRISPRs are segments of prokaryotic DNA 
         containing short repetitions of base sequences. Each repetition is followed by short segments of... (continued)' ## Example output ## ['CRISPR', 'Genetic Engineering', 'Biology'] `,
        },
        { role: "user", content: `User text you need to analyze and generate three tags for: ${content}` },
      ],
      model: "gpt-4",
      functions: functions,
      function_call: { name: "validate_tags" },
    });

    const responseMessage = response.choices[0].message;

    if (responseMessage.function_call) {
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);
      return functionArgs.tags;
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function evaluatePostContent(content: string) {
  const functions = [
    {
      name: "isEducationalPost",
      description: "this function accepts a single Boolean parameter that is True if the content of the text submitted by user is educational and false otherwise ",
      parameters: {
        type: "object",
        properties: {
          isEducationalPost: {
            description: "Set to True is the text submitted by user has educational content. Set to false if text has no educational content, or the content is purely for entertaiment purposes.",
            enum: ["True", "False"],
          },
        },
        required: ["isEducationalPost"],
      },
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "analyze the text submitted by user and decide if the text could be considered educational or not. Call the function with corresponding parameter" },
        { role: "user", content: content },
      ],
      model: "gpt-3.5-turbo",
      functions: functions,
      function_call: { name: "isEducationalPost" },
    });

    const responseMessage = response.choices[0].message;

    if (responseMessage.function_call) {
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);
      return functionArgs.isEducationalPost;
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function assignSmartCollection(collectionsList: string[], user_input: string) {
  const functions = [
    {
      name: "assignCollectionTopic",
      description: `this function accepts the topic of a smart collection and a boolean indicating 
      whether this topic is a newly generated topic (set to True) or is one of the existing topic from the provided list (set to False).  `,
      parameters: {
        type: "object",
        properties: {
          collectionTopic: {
            type: "string",
            description: `Topic of the collection. Could be one of the existing collection topics or a new topic.
             If the topic is one of the existing topics (in the enum list), then this argument should be a single string with topic name and isNewTopic boolean should be set to False. 
             If the topic is a new topic generated by you, leave this parameter empty.`,
            enum: collectionsList,
          },
          isNewTopic: {
            type: "boolean",
            description: `If a topic you assigned to the collection is a newly generated topic, set this boolean to True. Set it to False, if you used one of the existing topics `,
            enum: ["True", "False"],
          },
          newTopicName: {
            type: "string",
            description: `This parameter should be filled out with name of a new topic, only if you decided that the list of current colleciton topics doesn't fit the text written by user. 
            If you used one of the existing topics leave this argument blank`,
          },
        },
        required: ["isNewTopic"],
      },
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are content analyzer bot. Your job is to analyze the content written by user and assign this text a smartCollection topic. 
          The list of the existing topics is below. You need to decide if any of the existing topics could be used for the user's text and if so, 
          you need to fill this existing topic into 'collectionTopic' argument of the assignSmartCollection function and set 'isNewTopic' boolean to 'False'.
          If none of the existing topics fit user's text, you need to come up with new topic's name and set 'isNewTopic' to 'True' and fill out 'newTopicName' with the name of newly generated topic.
          ## List of current topics you need to refer to:  ${collectionsList} `,
        },
        { role: "user", content: `User text you need to analyze and assign topic to : ${user_input}` },
      ],
      model: "gpt-4",
      functions: functions,
      function_call: { name: "assignCollectionTopic" },
    });

    const responseMessage = response.choices[0].message;

    if (responseMessage.function_call) {
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);
      let topic;
      const isNewTopic = functionArgs.isNewTopic;
      if (isNewTopic) {
        topic = functionArgs.newTopicName;
      } else {
        topic = functionArgs.collectionTopic;
      }

      return { topic, isNewTopic };
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function getFeedFilters(userQuery: string, allTags: string[]) {
  console.log(userQuery);

  const functions = [
    {
      name: "extractForbiddenTags",
      description: `Identify and return tags that the user wants to avoid in their feed based on their input.`,
      parameters: {
        type: "object",
        properties: {
          forbiddenTags: {
            type: "array",
            items: {
              name: "forbiddenTag",
              type: "string",
              description: "A tag that should be excluded based on user preference.",
              enum: allTags,
            },
            description: `An array of tags to be excluded from the user's feed.`,
          },
        },
        required: ["forbiddenTags"],
      },
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a tag-analyzing bot. Analyze a user's request about their preferred social media feed, identify the tags they want to avoid, 
          and call the 'extractForbiddenTags' function with an array of those unwanted tags. The available tags are: ${allTags}. 
          Example: If the user says: "Only show me posts about science" and the available tags are ['politics', 'economy', 'science'], 
          you should identify and return ['politics', 'economy'] as the forbidden tags.`,
        },
        { role: "user", content: `User query to select forbidden tags from: ${userQuery}` },
      ],
      model: "gpt-4",
      functions: functions,
      function_call: { name: "extractForbiddenTags" },
    });

    const responseMessage = response.choices[0].message;
    console.log(responseMessage);

    if (responseMessage.function_call) {
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);
      return functionArgs.forbiddenTags;
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function getDailyContent(goal: string) {
  const functions = [
    {
      name: "generateLearningContent",
      description: `Generate a list of 7 posts with content (200-300 words each) and daily messages based on the user's learning goal.`,
      parameters: {
        type: "object",
        properties: {
          learningPosts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                postContent: {
                  type: "string",
                  description: "Content of the learning post.",
                },
                dailyMessage: {
                  type: "string",
                  description: "A message describing the learning journey status.",
                },
              },
              required: ["postContent", "dailyMessage"],
            },
            description: "An array of objects, each containing a post and a daily message.",
          },
        },
        required: ["learningPosts"],
      },
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a learning content generator bot. Your task is to create a series of 7 learning posts and daily messages 
          based on a user's weekly learning goal. The posts should be 200-300 words long and should gradually guide the user through the learning topic.
          The daily messages should inform the user of their current progress, anticipate future learnings, and review past contents if applicable.`,
        },
        { role: "user", content: goal },
      ],
      model: "gpt-4",
      functions: functions,
      function_call: { name: "generateLearningContent" },
    });

    const responseMessage = response.choices[0].message;

    if (responseMessage.function_call) {
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);
      return functionArgs.learningPosts;
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function getSearchTags(allTags: string[], query: string) {
  console.log("TAGS", allTags);
  const functions = [
    {
      name: "selectRelevantTags",
      description: `Select up to 5 most relevant tags based on the user query.`,
      parameters: {
        type: "object",
        properties: {
          searchTags: {
            type: "array",
            items: {
              type: "string",
              enum: allTags,
            },
            description: "Tags from user's previous posts.",
          },
        },
        required: ["searchTags"],
      },
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a tag selection assistant. Your task is to select up to 5 most relevant tags from a given list of tags based on a user's search query.`,
        },
        {
          role: "user",
          content: `Here is the search query ${query}. Select most relevant tags that correspond to this query from this collection of tags
           and fill out 'searchTags' parameter  of 'selectRelevantTags' function with them. Tags to choose from ${allTags}`,
        },
      ],
      model: "gpt-4",
      functions: functions,
      function_call: {
        name: "selectRelevantTags",
      },
    });

    const responseMessage = response.choices[0].message;
    if (responseMessage.function_call) {
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);
      console.log(responseMessage);
      return functionArgs.searchTags;
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
