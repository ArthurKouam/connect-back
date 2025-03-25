import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from "@ioc:Adonis/Lucid/Database";
import Friend from 'App/Models/Friend';
import User from 'App/Models/User';

export default class FriendsController {
  async myFriends({auth, response}: HttpContextContract){

    const  user = auth.user;

    try {
      if(user){
        const friends = await Friend
          .query()
          .where('first_user', user.id)
          .orWhere('second_user', user.id);

          const friendList = await User
            .query()
            .whereIn('id', friends.map(friend => friend.first_user == user.id ? friend.second_user : friend.first_user))

        return response.status(200).json(friendList);
      }
    } catch (error) {
      console.log(error)
    }
  }

  async deleteFriend({auth, request, response}: HttpContextContract){
    const {id}: {id: Number} = request.only(['id']);
    const user = auth.user;

    if(!user || id != user.id){
      return response.status(400).json({message: 'Authentication required'});
    }

    const { friendId } = request.only(['friendId']);

    try {
      await Database
      .from('friends')
      .where('id', friendId)
      .delete();

      return response.status(200).send({message: "reussi"})
    } catch (error) {
      console.log(error);
    }
  }
}
