import { Message, MessageReaction } from 'discord.js';
import { random } from './random';

export class Reactor {
  private reactions = {
    success: ['👍'],
    failure: ['⛔'],
    awaiting: ['a:loading:718307876724015105'],
  };

  /**
   * Sets the success reactions.
   *
   * @param reactions - the reactions to add.
   */
  setSuccessReactions(...reactions: string[]): void {
    this.reactions.success = reactions;
  }

  /**
   * Sets the failure reactions.
   *
   * @param reactions - the reactions to add.
   */
  setFailureReactions(...reactions: string[]): void {
    this.reactions.failure = reactions;
  }

  /**
   * Sets the awaiting reactions.
   *
   * @param reactions - the reactions to add.
   */
  setAwaitingReactions(...reactions: string[]): void {
    this.reactions.awaiting = reactions;
  }

  /**
   * Automatically adds emoji to indicate the state of a request.
   *
   * @param message - the message to react to.
   * @param promise - the promise to wait for.
   * @returns the resolved promise.
   */
  async loading<T>(message: Message, promise: Promise<T>): Promise<T> {
    const reactionPromise = this.awaiting(message);

    try {
      const [response] = await Promise.all([
        promise,
        reactionPromise,
      ]);

      await this.success(message);

      return response;
    } catch (error) {
      await this.failure(message);

      throw error;
    } finally {
      const reaction = await reactionPromise;

      await Promise.all(
        Array.from(reaction.users.cache.values())
          .filter((user) => user.bot)
          .map(({ id }) => reaction.users.remove(id)),
      );
    }
  }

  /**
   * Indicates to the user that the command failed for some reason.
   *
   * @param message - the message to react to.
   * @returns the reaction
   */
  failure(message: Message): Promise<MessageReaction> {
    return message.react(random.pickone(this.reactions.failure));
  }

  /**
   * Indicates to the user that the command was executed successfully.
   *
   * @param message - the message to react to.
   * @returns the reaction
   */
  success(message: Message): Promise<MessageReaction> {
    return message.react(random.pickone(this.reactions.success));
  }

  /**
   * Indicates to the user that the command is in progress.
   *
   * @param message - the message to react to.
   * @returns the reaction
   */
  awaiting(message: Message): Promise<MessageReaction> {
    return message.react(random.pickone(this.reactions.awaiting));
  }
}

export const reactor = new Reactor();
