/**
 * Represents a message in the chat.
 */
export interface Message {
  /**
   * The content of the message.
   */
  content: string;
  /**
   * The sender of the message.
   */
  sender: string;
}

/**
 * Asynchronously generates a response to a user query using an AI model.
 *
 * @param query The user's query.
 * @returns A promise that resolves to a Message object containing the AI's response.
 */
export async function getAIResponse(query: string): Promise<Message> {
  // TODO: Implement this by calling an LLM.

  return {
    content: `This is a response to: ${query}`,
    sender: 'AI',
  };
}
