import Application from '@ioc:Adonis/Core/Application';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import Image from 'App/Models/Image';
import Post from 'App/Models/Post';
import User from 'App/Models/User';

export default class PostsController {

  async newPost({auth, response, request}: HttpContextContract){
    const user = auth.user;

    if(user){
      const {description} = request.only(['description']);
      const files = request.files('picture', {
        extnames: ['png', 'jpeg', 'jpg', 'webp'],
      });
      const post = await Post.create({
        description,
        user: user.id,
      })

      for (const file of files) {
        console.log(file.fileName);
        const newFile = await Image.create({
          link: 'temp',
          post: post.id,
        })
        await file.move(Application.tmpPath('uploads/post'), {
          name: newFile.id.toString() + '.' + file.extname,
          overwrite: true
        })

        await Database
          .from('images')
          .where('id', newFile.id)
          .update('link', newFile.id.toString() + '.' + file.extname)
      }

      return response.status(200).json({
        message: "Ajouter avec succes",
        status: 200,
      })


    }else{
      return response.status(401).badRequest({
        message: "L'utilisateur n'est pas connecté"
      })
    }
  }

  async getPost({request, response}: HttpContextContract){
    const id = request.param('id');

    if(id){
      const post = await Post.find(id);

      if(post){
        const images = await Database
          .from('images')
          .select('*')
          .where('post', post.id);

        const user = await User.find(post.user);

        return response.json({
          status: 200,
          post,
          images,
          user
        })
      }else{
        return response.badRequest({
          message: "Post introuvable"
        })
      }
    }
  }

  async postsForUser({ request, response }: HttpContextContract){

    const  idUser = request.param('id');

    try {
      if(idUser){
        const posts = await Database
          .from('posts')
          .select('*')
          .where('user', idUser);

        let tabPost: object[] = [];

        for (const post of posts) {
          if(post){
            const images = await Database
              .from('images')
              .select('*')
              .where('post', post.id);

            tabPost.push({
              post,
              images,
            })
          }
        }

        return response.status(200).json(tabPost);
      }
    } catch (error) {
      console.log(error)
    }

  }

  async getAllPost({request, response}: HttpContextContract){
    const { page } = request.only(['page'])
    console.log(page);
    try {
      const posts = await Post
        .query()
        .preload('commentaires')
        .withCount('commentaires')
        .orderBy('id', 'desc')
        .paginate(page, 10)


      const tabPosts : any[] =[]


      for (const post of posts) {
        const user = await Database
          .from('users')
          .select('id', 'name', 'username', 'picture')

        const  image = await Image
          .query()
          .where('post', post.id);

        tabPosts.push({
          post,
          user,
          image,
        });
      }

      return response.status(200).json({tabPosts, meta: posts.getMeta()});

    }catch (e) {
      console.log(e);
      return response.status(500).json({
        error: e,
        message: "Erreur du serveur"
      })
    }
  }

}
