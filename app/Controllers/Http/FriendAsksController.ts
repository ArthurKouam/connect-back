import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import FriendAsk from "App/Models/FriendAsk";
import Database from "@ioc:Adonis/Lucid/Database";
import Friend from "App/Models/Friend";


export default class FriendAsksController {
  async  newAsk({auth, request, response}: HttpContextContract){
    const  user = auth.user;

    if(!user){
      return response.badRequest({status:401, message:"Not Found"});
    }

    const second: {id: number}  = request.only(['id']);

    const exist = await FriendAsk
      .query()
      .where("fromUser", user.id)
      .andWhere("toUser", second.id);

    if (exist.length>0){
      return response.badRequest({status:400, message:"Bad Request"});
    }

    await  FriendAsk.create({
      fromUser: user.id,
      toUser: second.id,
    })

    return response.status(200).json({status:200, message:"Successfully"});
  }

  async acceptAsk({auth, request, response}: HttpContextContract){
    const user = auth.user;

    if(!user){
      return response.badRequest({status:401, message:"Not Found"});
    }

    const {first, second} = request.only(['first', 'second']);

    console.log("first: ", first)
    console.log("second: ", second)

    if(second == user.id){
     try {
      const  exist = await  Database
        .from('friends')
        .select('*')
        .where('first_user', first)
        .where('second_user', second);

      if(exist.length === 0){
        await  Friend.create({
          first_user: first,
          second_user: second,
        })

        await Database
          .from('friend_asks')
          .select('*')
          .where('from_user', first)
          .where('to_user', second)
          .delete()

      }
     } catch (error) {
      console.log(error)
      return response.status(500).json({message: "Erreur du serveur"})
      
     }
    }

  }

  async rejectAsk({auth, request, response}: HttpContextContract){
    const user = auth.user;
    if(!user){
      return response.badRequest({status:401, message:"Not Found"});
    }

    const {first, second} = request.only(['first', 'second']);

    try {
      await Database
          .from('friend_asks')
          .select('*')
          .where('from_user', first)
          .where('to_user', second)
          .delete()

      return  response.status(200).json({status:200, message:"Successfully"});
    }catch (e) {
      console.log(e)
      return response.status(500).json({status:500, message:"Error"});
    }

  }

  async getAskForUser({auth, response}: HttpContextContract){
    const  second = auth.user?.id;

    try {
      if(second){
        const asks = await  FriendAsk
          .query()
          .select('*')
          .where('to_user', second)

        const tabAsk: object[] = [];

        for (const ask of asks) {
          const user = await Database
            .from('users')
            .select(['name', 'username', 'id', 'picture'])
            .where('id', ask.fromUser);

          tabAsk.push(user[0]);
        }

        return response.status(200).json(tabAsk);
      }
    }catch (e) {
      console.log(e);
      return response.status(500).json({
        message: 'Erreur du serveur'
      })
    }
  }

  async recommendFriends({request, response}: HttpContextContract){ {

    const userId = request.param('id');

    const friends = await Friend
      .query()
      .select('*')
      .where('first_user', userId)
      .orWhere('second_user', userId);

    const asks = await FriendAsk
      .query()
      .where('from_user', userId)
      .orWhere('to_user', userId);


    if (friends.length === 0) {
      const randomUsers = await Database
        .from('users')
        .select('*')
        .whereNot('id', userId)
        .andWhereNotIn('id', asks.map(ask => ask.fromUser === parseInt(userId) ? ask.toUser : ask.fromUser))
        .orderByRaw('RANDOM()');

      return response.status(200).json(randomUsers);
    }

    const nonFriends = await Database
      .from('users')
      .select('*')
      .whereNot('id', userId)
      .andWhereNotIn('id', friends.map(friend => friend.first_user === parseInt(userId) ? friend.second_user : friend.first_user))
      .andWhereNotIn('id', asks.map(ask => ask.fromUser === parseInt(userId) ? ask.toUser : ask.fromUser));



    const similarities = nonFriends.map(nonFriend => {
      const commonFriends = friends.filter(friend => {
        if (friend.first_user === userId) {
          return friend.second_user === nonFriend.id;
        } else {
          return friend.first_user === nonFriend.id;
        }
      });
      const similarity = commonFriends.length / friends.length;
      return { nonFriend, similarity };
    });

    similarities.sort((a, b) => b.similarity - a.similarity);


    const filteredSimilarities = similarities.filter(similarity => {

      return true
    });

    const tab = filteredSimilarities.map(similarity => similarity.nonFriend);
    if(tab.length == 0){
      const randomUsers = await Database
        .from('users')
        .select('*')
        .whereNot('id', userId)
        .andWhereNotIn('id', asks.map(ask => ask.fromUser === parseInt(userId) ? ask.toUser : ask.fromUser))
        .orderByRaw('RANDOM()');

      return response.status(200).json(randomUsers);
    }
    return response.status(200).json(tab);
  }
  }

  async getMyAsk({auth, response}: HttpContextContract){
    const  first = auth.user?.id;

    try {
      if(first){
        const asks = await  Database
          .from('friend_asks')
          .select('*')
          .where('from_user', first)

        const tabAsk: object[] = [];

        for (const ask of asks) {
          const user = await Database
            .from('users')
            .select(['name', 'username', 'id', 'picture'])
            .where('id', ask.to_user)

          tabAsk.push(user[0]);
        }

        return response.status(200).json(tabAsk);
      }
    }catch (e) {
      console.log(e);
      return response.status(500).json({
        message: 'Erreur du serveur'
      })
    }
  }
}
