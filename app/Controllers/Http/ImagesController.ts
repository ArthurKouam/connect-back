import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Drive from "@ioc:Adonis/Core/Drive";

export default class ImagesController {
  async getImage({request, response}: HttpContextContract){
    const fileName = request.param('filename');
    const path = request.param('path')

    const  filePath = path == "upload" ? `${fileName}` : `picture/${fileName}`
    
    try {
      console.log(filePath)
      const exists = await  Drive.exists(filePath)
      console.log(exists)
      if(!exists){
        return response.status(404).json("Image not found")
      }

      const stream = await  Drive.getStream(filePath);

      response.status(200).send(stream)
    }catch (e) {
      console.log(e);
      return response.status(500).json({
        message: 'Error retrieving image'
      })
    }
  }
}
