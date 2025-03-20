import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import Friend from 'App/Models/Friend';
import User from 'App/Models/User';

export default class UsersController {

  async register({request, response, auth}: HttpContextContract){
    console.log('Try register...')

    const { email, name, username, password }: {[key: string]: string} = request.only(['email', 'name', 'username', 'password']);
    try {
      const tryName = await User.findBy('username', username);

      if(tryName){
        return response.status(500).json({
          code: 'ERR_USERNAME',
          message: 'Nom d\'utilisateur deja utilisé'
        })
      }

      const tryEmail = await User.findBy('username', email);

      if(tryEmail){
        return response.status(500).json({
          code: 'ERR_EMAIL',
          message: 'Adresse mail deja utilisé'
        })
      }


      const user = await User.create({
        email: email.toLowerCase(),
        username,
        name,
        password,
      })


      const token = await auth.use('api').attempt(email, password);

      return response.status(200).json({
        user: {
          id: user.id,
          picture: user.picture,
          email,
          username,
          name,
        },
        token,
      })

    } catch (error) {
      return response.status(500).json({
        error,
        message: "erreur: erreur lors de l'enregistrement",
      })
    }

  }

  async login({response, request, auth}: HttpContextContract){
    const { email, password } = request.only(['email', 'password']);

    try {
      const token = await auth.use('api').attempt(email.toLowerCase(), password);

      const user = await User.findBy('email', email.toLowerCase());
      console.log('Progress...')
      return response.json({
        status: 200,
        user: {
          id: user?.id,
          email: user?.email,
          username: user?.username,
          picture: user?.picture,
          name: user?.name,
        },
        token,
      })
    } catch (error) {
      return response.badRequest({
        status: 500,
        error,
      })
    }
  }

  async getUser({request, response, auth}: HttpContextContract) {

    const userId = request.param('id');

    try {
      const user = await User.find(userId);

      if (user) {
        const reqUse = auth.user?.id!;

        const friend1 = await Friend
          .query()
          //.where('first_user', reqUse) 
          //.andWhere('second_user', userId)


        const friend2 = await Friend
        .query()
        //.where('first_user', userId) 
        //.andWhere('second_user', reqUse)

        const friend = friend1.length == 0 ? friend2 : friend1;


        return response.status(200).json({
          user,
          isfriend: friend.length != 0,
        })
          
      }
    } catch (error) {
      console.log(error)
    }

  }

  async addProfilePicture({request, response, auth}: HttpContextContract){
    const user = auth.user;

    if (user) {
      const file = request.file('picture', {
        extnames: ['png', 'jpg', 'jpeg', 'webp'],
        size: '1 mb'
      });

      if(file){
        await file.move(Application.tmpPath('uploads/picture'), {
          name: user.id.toString() + '.' + file.extname,
          overwrite: true,
        })
        await Database
          .from('users')
          .select('id', user.id)
          .update('picture', user.id.toString() + '.' + file.extname)

        return response.json({
          status: 200
        })
      }else{
        return response.json({
          status: 500
        })
      }
    }else{
      return response.badRequest({
        message: "Cette utilisateur n'est pas authentifiée"
      })
    }
  }

  async checkUsername({ request, response }: HttpContextContract){
    const {id, username} = request.only(['id', 'username']);

    try {
      const user = await User.findBy('username', username);

      if(!user || user.id == id){
        return response.status(200).json({
          disponibility: true,
        })
      }else{
        return response.status(200).json({
          disponibility: false,
        })
      }
      
    } catch (error) {
      console.log(error);
    }

  }

  async modifyProfile({request, response}: HttpContextContract){

    const id = request.param('id');

    const { name, username } = request.only(['name', 'username']);

    const user = await User.find(id);
    const file = request.file('picture', {
      extnames: ['png', 'jpeg', 'jpg', 'webp'],
    });

    if(!user){
      return response.status(401).json({
        message: 'Failed to find user',
      })
    }

    console.log(file)

    if (file) {
      await file.move(Application.tmpPath('uploads/picture'), {
        name: user.id.toString() + '.' + file.extname,
        overwrite: true,
      })
    }

    try {
      await User
        .query()
        .where('id', user.id)
        .update({
          name,
          username,
          picture: file ? user.id.toString() + '.' + file.extname : null,
        })

      return response.status(200).json({
        message: "Update succesfull",
        user: {
          name: name,
          username: username,
          id,
          picture: file ? user.id.toString() + '.' + file.extname : null,
        }
      })
    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: "Erreur du serveur",
      })
    }
  }

}
