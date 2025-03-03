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

    if(second == user.id){
      const  exist = await  Database
        .from('friends')
        .select('*')
        .where('firstUser', first)
        .where('secondUser', second);

      if(!exist){
        await  Friend.create({
          firstUser: first,
          secondUser: second,
        })

        await Database
          .from('friend_asks')
          .select('*')
          .where('firstUser', first)
          .where('secondUser', second)
          .delete()

      }
    }

  }

  async rejectAsk({auth, request, response}: HttpContextContract){
    const user = auth.user;
    if(!user){
      return response.badRequest({status:401, message:"Not Found"});
    }

    const {first, second, id} = request.only(['first', 'second', 'id']);
    if(second == user.id && first){
      await Database.from('friend_asks')
        .select('*')
        .where('id', id)
        .delete()

      return  response.status(200).json({status:200, message:"Successfully"});

    }else {
      return response.badRequest({status:401, message:"Not Found"});
    }
  }

  async getAskForUser({auth, response}: HttpContextContract){
    const  second = auth.user?.id;

    try {
      if(second){
        const asks = await  Database
          .from('friend_asks')
          .select('*')
          .where('secondUser', second)

        const tabAsk: object[] = [];

        for (const ask of asks) {
          const user = await Database
            .from('users')
            .select('username', 'id', 'picture')
            .where('id', ask.firstUser)

          tabAsk.push(user);
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

  async getMyAsk({auth, response}: HttpContextContract){
    const  second = auth.user?.id;

    try {
      if(second){
        const asks = await  Database
          .from('friend_asks')
          .select('*')
          .where('firstUser', second)

        const tabAsk: object[] = [];

        for (const ask of asks) {
          const user = await Database
            .from('users')
            .select('username', 'id', 'picture')
            .where('id', ask.secondUser)

          tabAsk.push(user);
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
