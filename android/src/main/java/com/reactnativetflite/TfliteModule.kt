package com.reactnativetflite

import android.content.res.AssetManager
import android.graphics.BitmapFactory
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import org.tensorflow.lite.Interpreter
import java.io.FileInputStream
import java.io.IOException
import java.nio.ByteBuffer
import java.nio.FloatBuffer
import java.nio.MappedByteBuffer
import java.nio.channels.FileChannel

@ReactModule(name = TfliteModule.NAME)
class TfliteModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  @ReactMethod
  private fun initTensor(modelFile: String = "mobile_face_net", count: Int = 1, promise: Promise) {
    try {
      val assetManager = reactContext.assets
      val byteFile: MappedByteBuffer = loadModelFile(assetManager, modelFile)
      val options = Interpreter.Options()
      options.numThreads = count
      interpreter = Interpreter(byteFile, options)
      interpreter?.allocateTensors()
      promise.resolve("initialization tflite success")
    } catch (e: Exception) {
      e.printStackTrace()
      promise.reject(Throwable(e))
    }
  }

  @ReactMethod
  fun tensorImage(imagePath: String?, promise: Promise) {
    try {
      val bitmap = BitmapFactory.decodeFile(imagePath)
      val input: ByteBuffer = Convert().convertBitmapToBuffer(bitmap)
      val output: FloatBuffer = FloatBuffer.allocate(192)
      interpreter?.run(input, output)
      promise.resolve(output.array().contentToString())
    } catch (e: Exception) {
      e.printStackTrace()
      promise.reject(Throwable(e))
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

  override fun getName(): String {
    return NAME
  }

  companion object {
    const val NAME = "TfliteModule"
  }
}
