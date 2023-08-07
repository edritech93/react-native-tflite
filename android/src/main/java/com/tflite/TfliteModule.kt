package com.tflite

import android.content.res.AssetManager
import android.graphics.BitmapFactory
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import org.tensorflow.lite.Interpreter
import java.io.FileInputStream
import java.io.IOException
import java.nio.ByteBuffer
import java.nio.FloatBuffer
import java.nio.MappedByteBuffer
import java.nio.channels.FileChannel

@ReactModule(name = TfliteModule.NAME)
class TfliteModule(reactContext: ReactApplicationContext) :
  NativeTfliteSpec(reactContext) {

  override fun getName(): String {
    return NAME
  }

  override fun initTensor(modelPath: String?, count: Double?, promise: Promise?) {
    try {
      if (modelPath === null) {
        throw Error("modelPath is required")
      }
      val assetManager = reactApplicationContext.assets
      val byteFile: MappedByteBuffer = loadModelFile(assetManager, modelPath)
      val options = Interpreter.Options()
      options.numThreads = count as Int
      interpreter = Interpreter(byteFile, options)
      interpreter?.allocateTensors()
      promise?.resolve("initialization tflite success")
    } catch (e: Exception) {
      e.printStackTrace()
      promise?.reject(Throwable(e))
    }
  }

  override fun tensorImage(imagePath: String?, promise: Promise?) {
    try {
      val bitmap = BitmapFactory.decodeFile(imagePath)
      val input: ByteBuffer = Convert().bitmap2ByteBuffer(bitmap)
      val output: FloatBuffer = FloatBuffer.allocate(192)
      interpreter?.run(input, output)
      promise?.resolve(output.array().contentToString())
    } catch (e: Exception) {
      e.printStackTrace()
      promise?.reject(Throwable(e))
    }
  }

  override fun tensorBase64(imageString: String?, promise: Promise?) {
    try {
      if (imageString === null) {
        throw Error("imageString is required")
      }
      val bitmap = Convert().base642Bitmap(imageString)
      val input: ByteBuffer = Convert().bitmap2ByteBuffer(bitmap)
      val output: FloatBuffer = FloatBuffer.allocate(192)
      interpreter?.run(input, output)
      promise?.resolve(output.array().contentToString())
    } catch (e: Exception) {
      e.printStackTrace()
      promise?.reject(Throwable(e))
    }
  }

  @Throws(IOException::class)
  private fun loadModelFile(assets: AssetManager, modelFilename: String): MappedByteBuffer {
    val fileDescriptor = assets.openFd("$modelFilename.tflite")
    val inputStream = FileInputStream(fileDescriptor.fileDescriptor)
    val fileChannel = inputStream.channel
    val startOffset = fileDescriptor.startOffset
    val declaredLength = fileDescriptor.declaredLength
    return fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength)
  }

  companion object {
    const val NAME = "Tflite"
  }
}
