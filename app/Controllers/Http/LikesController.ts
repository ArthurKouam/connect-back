import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Like from "App/Models/Like";

export default class LikesController {
  async setLike({auth, request, response}: HttpContextContract){
    const user = auth.user;

    if(user){
      const postId = request.param('post');

      try {
        const exist = await Like
          .query()
          .select('*')
          .where('user', user.id)
          .where('post', postId)

        if(!exist){
          await Like.create({
            user: user.id,
            postId: postId
          })

          return response.status(200).json({
            like: true,
            message: "Successfully"
          })
        }else {
          await Like
            .query()
            .where('user', user.id)
            .where('post', postId)
            .delete()

          return response.status(200).json({
            like: false,
            message: "Successfully"
          })
        }

      }catch (e){
        return response.status(500).json({
          messge: "Probeme du serveur"
        })
      }
    }
  }

  async likeForPost({request, response}: HttpContextContract){

  }

}
