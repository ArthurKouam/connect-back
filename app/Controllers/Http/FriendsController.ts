import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from "@ioc:Adonis/Lucid/Database";

export default class FriendsController {
  async myFriends({auth, request, response}: HttpContextContract){
    const  user = auth.user;

    const id = request.param('id');

    if(!user || id != user.id){
      return response.status(501).json({message: 'Authentication required'});
    }

    try {
      const friend1 = await Database
        .from('friends')
        .select('*')
        .where('firstUser', id)

      const friend2 = await Database
        .from('friends')
        .select('*')
        .where('secondUser', id)

      return response.status(200).json([...friend1, ...friend2]);
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
