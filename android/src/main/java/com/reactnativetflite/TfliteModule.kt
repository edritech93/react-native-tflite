package com.reactnativetflite

import android.content.res.AssetManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.tensorflow.lite.Interpreter
import java.io.FileInputStream
import java.io.IOException
import java.nio.MappedByteBuffer
import java.nio.channels.FileChannel

class TfliteModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private lateinit var interpreter: Interpreter

  override fun getName(): String {
    return "Tflite"
  }

  @ReactMethod
  fun initTensor(modelFile: String, count: Int, promise: Promise) {
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
    val fileDescriptor = assets.openFd(modelFilename)
    val inputStream = FileInputStream(fileDescriptor.fileDescriptor)
    val fileChannel = inputStream.channel
    val startOffset = fileDescriptor.startOffset
    val declaredLength = fileDescriptor.declaredLength
    return fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength)
  }

  @ReactMethod
  fun tensorImage(imagePath: String?, promise: Promise) {
    promise.resolve(imagePath)
  }
}
