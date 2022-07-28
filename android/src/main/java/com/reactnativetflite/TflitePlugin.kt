package com.reactnativetflite

import android.annotation.SuppressLint
import android.graphics.BitmapFactory
import android.media.Image
import androidx.camera.core.ImageProxy
import com.facebook.react.bridge.WritableNativeMap
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin
import java.nio.ByteBuffer
import java.nio.FloatBuffer

class TflitePlugin(name: String) : FrameProcessorPlugin(name) {

  @SuppressLint("UnsafeOptInUsageError")
  override fun callback(image: ImageProxy, params: Array<Any>): Any? {
    val mediaImage: Image? = image.image
    if (mediaImage != null) {
      val buffer = mediaImage.planes[0].buffer
      val bytes = ByteArray(buffer.capacity())
      buffer[bytes]
      val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size, null)
      val input: ByteBuffer = Convert().convertBitmapToBuffer(bitmap)
      val output: FloatBuffer = FloatBuffer.allocate(192)
      val helper = Helper()
      helper.interpreter?.run(input, output)
      val map = WritableNativeMap()
      map.putString("data", output.array().contentToString())
      return map
    }
    return null
  }
}
