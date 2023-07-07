package com.tflite

import android.annotation.SuppressLint
import androidx.camera.core.ImageProxy
import com.facebook.react.bridge.WritableNativeMap
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin
import java.nio.ByteBuffer
import java.nio.FloatBuffer

class TflitePlugin(name: String) : FrameProcessorPlugin(name) {

  @SuppressLint("UnsafeOptInUsageError")
  override fun callback(image: ImageProxy, params: Array<Any>): Any? {
    val byteArray = Convert().imageProxy2ByteArray(image)
    if (byteArray != null)  {
      val bitmap = Convert().byteArray2Bitmap(byteArray)
      val input: ByteBuffer = Convert().bitmap2ByteBuffer(bitmap)
      val output: FloatBuffer = FloatBuffer.allocate(192)
      interpreter?.run(input, output)
      val map = WritableNativeMap()
      map.putString("data", output.array().contentToString())
      return map
    }
    return null
  }
}
