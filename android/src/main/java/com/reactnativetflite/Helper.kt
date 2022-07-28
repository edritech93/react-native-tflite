package com.reactnativetflite

import org.tensorflow.lite.Interpreter

class Helper {
  var interpreter: Interpreter? = null
    get() = field                     // getter
    set(value) { field = value }      // setter
}
