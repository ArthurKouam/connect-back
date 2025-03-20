/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for the majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', ( {response} )=> response.send("<h1>Hello world</h1>") )

Route.group(()=>{
  Route.post('/login', 'UsersController.login');
  Route.post('/register', 'UsersController.register');
}).prefix('auth')

Route.put('/user/:id', 'UsersController.modifyProfile').middleware('auth')
Route.get('/user/username/check', 'UsersController.checkUsername')
Route.get('/user/:id', 'UsersController.getUser')


Route.group(()=>{
  Route.post('/', 'PostsController.newPost').middleware('auth');
  Route.get('/', 'PostsController.getAllPost');
  Route.get('/users/:id', 'PostsController.postsForUser')
  Route.get('/:id', 'PostsController.getPost');
}).prefix('posts')

Route.group(()=>{
  Route.get('/', 'FriendsController.myFriends')
  
}).prefix('friend').middleware('auth')

Route.group(()=>{
  Route.post('/', 'FriendAsksController.newAsk')
  Route.delete('/', 'FriendAsksController.rejectAsk')
  Route.put('/', 'FriendAsksController.acceptAsk')
  Route.get('/recommend/:id', 'FriendAsksController.recommendFriends')
  Route.get('/for_user', 'FriendAsksController.getAskForUser');
  Route.get('/from_user', 'FriendAsksController.getMyAsk');
}).prefix('friend-requests').middleware('auth')

Route.group(()=>{
  Route.post('/:post', 'CommentairesController.addCommentaire').middleware('auth');
  Route.get('/:post', 'CommentairesController.getAllCommentaire')

}).prefix('commentaire')

Route.post('/like/:post', 'LikesController.setLike').middleware('auth')
Route.get('/like/:post', 'LikesController.likeForPost')

Route.get('/image/:path/:filename', 'ImagesController.getImage');
