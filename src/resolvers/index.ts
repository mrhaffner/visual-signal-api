import { withFilter } from 'graphql-subscriptions';
import List from '../models/list';
import Card from '../models/card';
import Board from '../models/board';
import Member from '../models/member';
import { getBoardById, getMyBoards } from './controllers';
import {
  AuthenticationError,
  UserInputError,
  ValidationError,
} from 'apollo-server-errors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import me from './me';
import getAggBoard from './getAggBoard';
import pubsub from './pubsub';
// import createBoard from './mutations/createBoard';
import mutations from './mutations';
import getMyMemberLevel from './getMyMemberLevel';

dotenv.config();
// const pubsub = new PubSub();
const JWT_SECRET = process.env.JWT_SECRET;

const resolvers = {
  Query: {
    allBoards: async () => {
      return await Board.find();
    }, //for testing only
    getBoardById,
    getMyBoards,
    allLists: async () => {
      const lists = await List.aggregate([
        {
          $lookup: {
            from: 'cards',
            localField: '_id',
            foreignField: 'idList',
            pipeline: [
              {
                $sort: { pos: 1 },
              },
            ],
            as: 'cards',
          },
        },
      ]).sort('pos');
      return lists;
    }, //for testing only
    getAllCards: async () => {
      return await Card.find();
    }, //for testing only
    getCardById: async (_: any, { _id }: any) => {
      return await Card.findOne({ _id });
    }, //for testing now, but may be used later
    getMyMemberInfo: async (_: any, __: any, { currentMember }: any) => {
      //make this so it only returs the needed fields, definitely not password
      // return ctx.currentMember;
      return await me(currentMember._id);
    },
    getAllMembers: async () => {
      return await Member.find();
    }, //for testing only
    getMemberByEmail: async (_: any, { email }: any) => {
      return await Member.findOne({ email });
    }, //may be used in the future, probably needs a version for admins and non admids or some sort of auth
  },
  Mutation: {
    ...mutations,
    updateMemberBoards: async (_: any, { input }: any) => {
      const { _id, boards } = input;
      //change to single board and handle updated array here
      return await Member.findOneAndUpdate(
        { _id },
        { boards },
        {
          new: true,
        },
      );
    }, //not currently used
    updateMemberPassword: async (_: any, { input }: any) => {
      const { _id, password } = input;
      return await Member.findOneAndUpdate(
        { _id },
        { password },
        {
          new: true,
        },
      );
    }, //not currently used
    deleteMember: async (_: any, { _id }: any) => {
      try {
        await Member.findOneAndRemove({
          _id,
        });
        //need to delete reference to member in all boards that contain them as a member
        return _id;
      } catch (e) {
        console.log(e);
        return null;
      }
    }, //not currently used
  },
  Subscription: {
    newBoard: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('NEW_BOARD'),
        (payload, variables, ctx) => {
          return (
            ctx.currentMember._id.toString() ===
            payload.newBoard.memberId.toString()
          );
        },
      ),
    },
    boardUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('BOARD_UPDATED'),
        async (payload, _, ctx) => {
          try {
            const boards = await getMyBoards(null, null, ctx);

            for (const x of boards) {
              if (x._id.toString() === payload.boardUpdated[0]._id.toString())
                return true;
            }
            return false;
          } catch (e) {
            console.log(e);
          }
        },
      ),
    },
    boardDeleted: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('BOARD_DELETED'),
        (payload, variables) => {
          for (const id of variables.idBoards) {
            if (payload.boardDeleted === id) {
              return true;
            }
          }
          return false;
        },
      ),
    },
    removeFromBoard: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('REMOVED_FROM_BOARD'),
        (payload, variables, ctx) => {
          return (
            payload.removeFromBoard.memberId.toString() ===
            ctx.currentMember._id.toString()
          );
        },
      ),
    },
  },
};

export default resolvers;
