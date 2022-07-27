package com.reactnativetflite.tflite

import android.annotation.SuppressLint
import android.content.res.AssetManager
import android.graphics.BitmapFactory
import android.media.Image
import android.util.Log
import androidx.camera.core.ImageProxy
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableNativeMap
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin
import com.reactnativetflite.Convert
import org.tensorflow.lite.Interpreter
import java.io.FileInputStream
import java.io.IOException
import java.nio.ByteBuffer
import java.nio.FloatBuffer
import java.nio.MappedByteBuffer
import java.nio.channels.FileChannel

class TflitePlugin(name: String, private val reactContext: ReactApplicationContext) :
  FrameProcessorPlugin(name) {
  private val TAG = "Tflite"
  private lateinit var interpreter: Interpreter
  private var isInitTensor = true

  override fun callback(image: ImageProxy, params: Array<Any>): Any? {
    if (isInitTensor) {
      initTensor()
    }
    isInitTensor = false

    // TODO: need fix tensor image
    return null

    @SuppressLint("UnsafeOptInUsageError")
    val mediaImage: Image? = image.image
    if (mediaImage != null) {
      val buffer = mediaImage.planes[0].buffer
      val bytes = ByteArray(buffer.capacity())
      buffer[bytes]
      val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size, null)

      val input: ByteBuffer = Convert().convertBitmapToBuffer(bitmap)
      val output: FloatBuffer = FloatBuffer.allocate(192)
      interpreter.run(input, output)
      val map = WritableNativeMap()
      map.putString("data", output.array().contentToString())
      return map
    }
    return null
  }

  private fun initTensor(modelFile: String = "mobile_face_net", count: Int = 1) {
    try {
      val assetManager = reactContext.assets
      val byteFile: MappedByteBuffer = loadModelFile(assetManager, modelFile)
      val options = Interpreter.Options()
      options.numThreads = count
      interpreter = Interpreter(byteFile, options)
      interpreter.allocateTensors()
      Log.e(TAG, "initialization tflite success")
    } catch (e: Exception) {
      e.printStackTrace()
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

  fun tensorImage(imagePath: String?): Any? {
    return try {
      val bitmap = BitmapFactory.decodeFile(imagePath)
      val input: ByteBuffer = Convert().convertBitmapToBuffer(bitmap)
      val output: FloatBuffer = FloatBuffer.allocate(192)
      interpreter.run(input, output)
      output.array().contentToString()
    } catch (e: Exception) {
      e.printStackTrace()
      null
    }
  }
}
