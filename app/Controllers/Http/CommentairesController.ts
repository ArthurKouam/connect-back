import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Commentaire from "App/Models/Commentaire";
import User from "App/Models/User";

export default class CommentairesController {

  async addCommentaire({auth, request, response}: HttpContextContract){
    const { commentaire } = request.only(['commentaire'])
    const user = auth.user;
    const postId = request.param('post')

   try {
     if(user){
       if(commentaire !== ""){
         await Commentaire.create({
           postId: postId,
           user: user.id,
           content: commentaire
         })
       }
     }

     return response.status(200).json({
       message: "Successfully"
     })
   }catch (e){
      console.log(e);
      return response.status(500).json({
        message: "Erreur du serveur"
      })
   }
  }

  async getAllCommentaire({request, response}: HttpContextContract){
    const post = request.param('post');
    const tab: any[] = [];

    try {
      const commentaires = await Commentaire
        .query()
        .where('postId', post)

      for (const commentaire of commentaires){
        const user = User
          .query()
          .select(['id', 'name', 'username', 'picture'])
          .where('id', commentaire.user)

        tab.push({
          user,
          commentaire
        })
      }

      return response.status(200).json(tab);
    }catch (e){
      console.log(e);
      return response.status(500).json({
        message: "Erreur deu serveur"
      });
    }
  }

}
