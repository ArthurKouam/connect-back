import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import User from 'App/Models/User';

export default class UsersController {

  async register({request, response, auth}: HttpContextContract){
    console.log('Try register...')

    const { email, name, username, password }: {[key: string]: string} = request.only(['email', 'name', 'username', 'password']);
    try {
      const tryName = await User.findBy('username', username);

      if(tryName){
        throw new Error("Nom d'utilisateur déja utiliser");
      }



      const user = await User.create({
        email,
        username,
        name,
        password,
      })


      const token = await auth.use('api').attempt(email, password);

      return response.json({
        status: 200,
        user: {
          id: user.id,
          email,
          username,
          name
        },
        token,
      })

    } catch (error) {
      return response.badRequest({
        error,
        message: "erreur: erreur lors de l'enregistrement",
      })
    }

  }

  async login({response, request, auth}: HttpContextContract){
    const { email, password } = request.only(['email', 'password']);

    try {
      const token = await auth.use('api').attempt(email, password);

      const user = await User.findBy('email', email);
      console.log('Progress...')
      return response.json({
        status: 200,
        user: {
          id: user?.id,
          email: user?.email,
          usename: user?.username
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

}
