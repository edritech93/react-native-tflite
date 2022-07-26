package com.reactnativetflite

import android.content.res.AssetManager
import android.graphics.BitmapFactory
import com.facebook.react.bridge.*
import org.tensorflow.lite.Interpreter
import java.io.FileInputStream
import java.io.IOException
import java.nio.ByteBuffer
import java.nio.FloatBuffer
import java.nio.MappedByteBuffer
import java.nio.channels.FileChannel

class TfliteModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private lateinit var interpreter: Interpreter

  override fun getName(): String {
    return "Tflite"
  }

  @ReactMethod
  fun initTensor(modelFile: String, count: Int = 1, promise: Promise) {
    try {
      val assetManager = reactApplicationContext.assets
      val byteFile: MappedByteBuffer = loadModelFile(assetManager, modelFile)
      val options = Interpreter.Options()
      options.numThreads = count
      interpreter = Interpreter(byteFile, options)
      interpreter.allocateTensors()
      promise.resolve("initialization tflite success")
    } catch (e: Exception) {
      e.printStackTrace()
      promise.reject(Throwable(e))
      return
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

  @ReactMethod
  fun tensorImage(imagePath: String?, promise: Promise) {
    try {
      val bitmap = BitmapFactory.decodeFile(imagePath)
      val input: ByteBuffer = Convert().convertBitmapToBuffer(bitmap)
      val output: FloatBuffer = FloatBuffer.allocate(192)
      interpreter.run(input, output)
      promise.resolve(output.array().contentToString())
    } catch (e: Exception) {
      e.printStackTrace()
      promise.reject(Throwable(e))
      return
    }
  }

  @ReactMethod
  fun tensorFrame(imageFrame: String?, promise: Promise) {
    promise.resolve("123qwe")
//    try {
//      val buffer: ByteBuffer = imageFrame.planes[0].buffer
//      val bytes = ByteArray(buffer.capacity())
//      buffer[bytes]
//      val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size, null)
//
//      val input: ByteBuffer = Convert().convertBitmapToBuffer(bitmap)
//      val output: FloatBuffer = FloatBuffer.allocate(192)
//      interpreter.run(input, output)
//      promise.resolve(output.array().contentToString())
//    } catch (e: Exception) {
//      e.printStackTrace()
//      promise.reject(Throwable(e))
//      return
//    }
  }
}
