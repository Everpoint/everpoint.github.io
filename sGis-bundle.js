(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (global){
"use strict";

_dereq_(295);

_dereq_(296);

_dereq_(2);

if (global._babelPolyfill) {
  throw new Error("only one instance of babel-polyfill is allowed");
}
global._babelPolyfill = true;

var DEFINE_PROPERTY = "defineProperty";
function define(O, key, value) {
  O[key] || Object[DEFINE_PROPERTY](O, key, {
    writable: true,
    configurable: true,
    value: value
  });
}

define(String.prototype, "padLeft", "".padStart);
define(String.prototype, "padRight", "".padEnd);

"pop,reverse,shift,keys,values,entries,indexOf,every,some,forEach,map,filter,find,findIndex,includes,join,slice,concat,push,splice,unshift,sort,lastIndexOf,reduce,reduceRight,copyWithin,fill".split(",").forEach(function (key) {
  [][key] && define(Array, key, Function.call.bind([][key]));
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"2":2,"295":295,"296":296}],2:[function(_dereq_,module,exports){
_dereq_(119);
module.exports = _dereq_(23).RegExp.escape;
},{"119":119,"23":23}],3:[function(_dereq_,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],4:[function(_dereq_,module,exports){
var cof = _dereq_(18);
module.exports = function(it, msg){
  if(typeof it != 'number' && cof(it) != 'Number')throw TypeError(msg);
  return +it;
};
},{"18":18}],5:[function(_dereq_,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = _dereq_(117)('unscopables')
  , ArrayProto  = Array.prototype;
if(ArrayProto[UNSCOPABLES] == undefined)_dereq_(40)(ArrayProto, UNSCOPABLES, {});
module.exports = function(key){
  ArrayProto[UNSCOPABLES][key] = true;
};
},{"117":117,"40":40}],6:[function(_dereq_,module,exports){
module.exports = function(it, Constructor, name, forbiddenField){
  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};
},{}],7:[function(_dereq_,module,exports){
var isObject = _dereq_(49);
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"49":49}],8:[function(_dereq_,module,exports){
// 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
'use strict';
var toObject = _dereq_(109)
  , toIndex  = _dereq_(105)
  , toLength = _dereq_(108);

module.exports = [].copyWithin || function copyWithin(target/*= 0*/, start/*= 0, end = @length*/){
  var O     = toObject(this)
    , len   = toLength(O.length)
    , to    = toIndex(target, len)
    , from  = toIndex(start, len)
    , end   = arguments.length > 2 ? arguments[2] : undefined
    , count = Math.min((end === undefined ? len : toIndex(end, len)) - from, len - to)
    , inc   = 1;
  if(from < to && to < from + count){
    inc  = -1;
    from += count - 1;
    to   += count - 1;
  }
  while(count-- > 0){
    if(from in O)O[to] = O[from];
    else delete O[to];
    to   += inc;
    from += inc;
  } return O;
};
},{"105":105,"108":108,"109":109}],9:[function(_dereq_,module,exports){
// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
'use strict';
var toObject = _dereq_(109)
  , toIndex  = _dereq_(105)
  , toLength = _dereq_(108);
module.exports = function fill(value /*, start = 0, end = @length */){
  var O      = toObject(this)
    , length = toLength(O.length)
    , aLen   = arguments.length
    , index  = toIndex(aLen > 1 ? arguments[1] : undefined, length)
    , end    = aLen > 2 ? arguments[2] : undefined
    , endPos = end === undefined ? length : toIndex(end, length);
  while(endPos > index)O[index++] = value;
  return O;
};
},{"105":105,"108":108,"109":109}],10:[function(_dereq_,module,exports){
var forOf = _dereq_(37);

module.exports = function(iter, ITERATOR){
  var result = [];
  forOf(iter, false, result.push, result, ITERATOR);
  return result;
};

},{"37":37}],11:[function(_dereq_,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = _dereq_(107)
  , toLength  = _dereq_(108)
  , toIndex   = _dereq_(105);
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = toIObject($this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length)
      , value;
    // Array#includes uses SameValueZero equality algorithm
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    // Array#toIndex ignores holes, Array#includes - not
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};
},{"105":105,"107":107,"108":108}],12:[function(_dereq_,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx      = _dereq_(25)
  , IObject  = _dereq_(45)
  , toObject = _dereq_(109)
  , toLength = _dereq_(108)
  , asc      = _dereq_(15);
module.exports = function(TYPE, $create){
  var IS_MAP        = TYPE == 1
    , IS_FILTER     = TYPE == 2
    , IS_SOME       = TYPE == 3
    , IS_EVERY      = TYPE == 4
    , IS_FIND_INDEX = TYPE == 6
    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX
    , create        = $create || asc;
  return function($this, callbackfn, that){
    var O      = toObject($this)
      , self   = IObject(O)
      , f      = ctx(callbackfn, that, 3)
      , length = toLength(self.length)
      , index  = 0
      , result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined
      , val, res;
    for(;length > index; index++)if(NO_HOLES || index in self){
      val = self[index];
      res = f(val, index, O);
      if(TYPE){
        if(IS_MAP)result[index] = res;            // map
        else if(res)switch(TYPE){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(IS_EVERY)return false;          // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};
},{"108":108,"109":109,"15":15,"25":25,"45":45}],13:[function(_dereq_,module,exports){
var aFunction = _dereq_(3)
  , toObject  = _dereq_(109)
  , IObject   = _dereq_(45)
  , toLength  = _dereq_(108);

module.exports = function(that, callbackfn, aLen, memo, isRight){
  aFunction(callbackfn);
  var O      = toObject(that)
    , self   = IObject(O)
    , length = toLength(O.length)
    , index  = isRight ? length - 1 : 0
    , i      = isRight ? -1 : 1;
  if(aLen < 2)for(;;){
    if(index in self){
      memo = self[index];
      index += i;
      break;
    }
    index += i;
    if(isRight ? index < 0 : length <= index){
      throw TypeError('Reduce of empty array with no initial value');
    }
  }
  for(;isRight ? index >= 0 : length > index; index += i)if(index in self){
    memo = callbackfn(memo, self[index], index, O);
  }
  return memo;
};
},{"108":108,"109":109,"3":3,"45":45}],14:[function(_dereq_,module,exports){
var isObject = _dereq_(49)
  , isArray  = _dereq_(47)
  , SPECIES  = _dereq_(117)('species');

module.exports = function(original){
  var C;
  if(isArray(original)){
    C = original.constructor;
    // cross-realm fallback
    if(typeof C == 'function' && (C === Array || isArray(C.prototype)))C = undefined;
    if(isObject(C)){
      C = C[SPECIES];
      if(C === null)C = undefined;
    }
  } return C === undefined ? Array : C;
};
},{"117":117,"47":47,"49":49}],15:[function(_dereq_,module,exports){
// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = _dereq_(14);

module.exports = function(original, length){
  return new (speciesConstructor(original))(length);
};
},{"14":14}],16:[function(_dereq_,module,exports){
'use strict';
var aFunction  = _dereq_(3)
  , isObject   = _dereq_(49)
  , invoke     = _dereq_(44)
  , arraySlice = [].slice
  , factories  = {};

var construct = function(F, len, args){
  if(!(len in factories)){
    for(var n = [], i = 0; i < len; i++)n[i] = 'a[' + i + ']';
    factories[len] = Function('F,a', 'return new F(' + n.join(',') + ')');
  } return factories[len](F, args);
};

module.exports = Function.bind || function bind(that /*, args... */){
  var fn       = aFunction(this)
    , partArgs = arraySlice.call(arguments, 1);
  var bound = function(/* args... */){
    var args = partArgs.concat(arraySlice.call(arguments));
    return this instanceof bound ? construct(fn, args.length, args) : invoke(fn, args, that);
  };
  if(isObject(fn.prototype))bound.prototype = fn.prototype;
  return bound;
};
},{"3":3,"44":44,"49":49}],17:[function(_dereq_,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = _dereq_(18)
  , TAG = _dereq_(117)('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function(it, key){
  try {
    return it[key];
  } catch(e){ /* empty */ }
};

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"117":117,"18":18}],18:[function(_dereq_,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],19:[function(_dereq_,module,exports){
'use strict';
var dP          = _dereq_(67).f
  , create      = _dereq_(66)
  , redefineAll = _dereq_(86)
  , ctx         = _dereq_(25)
  , anInstance  = _dereq_(6)
  , defined     = _dereq_(27)
  , forOf       = _dereq_(37)
  , $iterDefine = _dereq_(53)
  , step        = _dereq_(55)
  , setSpecies  = _dereq_(91)
  , DESCRIPTORS = _dereq_(28)
  , fastKey     = _dereq_(62).fastKey
  , SIZE        = DESCRIPTORS ? '_s' : 'size';

var getEntry = function(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index !== 'F')return that._i[index];
  // frozen object case
  for(entry = that._f; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
};

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      anInstance(that, C, NAME, '_i');
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear(){
        for(var that = this, data = that._i, entry = that._f; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that._f == entry)that._f = next;
          if(that._l == entry)that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */){
        anInstance(this, C, 'forEach');
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3)
          , entry;
        while(entry = entry ? entry.n : this._f){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key){
        return !!getEntry(this, key);
      }
    });
    if(DESCRIPTORS)dP(C.prototype, 'size', {
      get: function(){
        return defined(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that._f)that._f = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index !== 'F')that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function(C, NAME, IS_MAP){
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function(iterated, kind){
      this._t = iterated;  // target
      this._k = kind;      // kind
      this._l = undefined; // previous
    }, function(){
      var that  = this
        , kind  = that._k
        , entry = that._l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!that._t || !(that._l = entry = entry ? entry.n : that._t._f)){
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if(kind == 'keys'  )return step(0, entry.k);
      if(kind == 'values')return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};
},{"25":25,"27":27,"28":28,"37":37,"53":53,"55":55,"6":6,"62":62,"66":66,"67":67,"86":86,"91":91}],20:[function(_dereq_,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var classof = _dereq_(17)
  , from    = _dereq_(10);
module.exports = function(NAME){
  return function toJSON(){
    if(classof(this) != NAME)throw TypeError(NAME + "#toJSON isn't generic");
    return from(this);
  };
};
},{"10":10,"17":17}],21:[function(_dereq_,module,exports){
'use strict';
var redefineAll       = _dereq_(86)
  , getWeak           = _dereq_(62).getWeak
  , anObject          = _dereq_(7)
  , isObject          = _dereq_(49)
  , anInstance        = _dereq_(6)
  , forOf             = _dereq_(37)
  , createArrayMethod = _dereq_(12)
  , $has              = _dereq_(39)
  , arrayFind         = createArrayMethod(5)
  , arrayFindIndex    = createArrayMethod(6)
  , id                = 0;

// fallback for uncaught frozen keys
var uncaughtFrozenStore = function(that){
  return that._l || (that._l = new UncaughtFrozenStore);
};
var UncaughtFrozenStore = function(){
  this.a = [];
};
var findUncaughtFrozen = function(store, key){
  return arrayFind(store.a, function(it){
    return it[0] === key;
  });
};
UncaughtFrozenStore.prototype = {
  get: function(key){
    var entry = findUncaughtFrozen(this, key);
    if(entry)return entry[1];
  },
  has: function(key){
    return !!findUncaughtFrozen(this, key);
  },
  set: function(key, value){
    var entry = findUncaughtFrozen(this, key);
    if(entry)entry[1] = value;
    else this.a.push([key, value]);
  },
  'delete': function(key){
    var index = arrayFindIndex(this.a, function(it){
      return it[0] === key;
    });
    if(~index)this.a.splice(index, 1);
    return !!~index;
  }
};

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      anInstance(that, C, NAME, '_i');
      that._i = id++;      // collection id
      that._l = undefined; // leak store for uncaught frozen objects
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function(key){
        if(!isObject(key))return false;
        var data = getWeak(key);
        if(data === true)return uncaughtFrozenStore(this)['delete'](key);
        return data && $has(data, this._i) && delete data[this._i];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key){
        if(!isObject(key))return false;
        var data = getWeak(key);
        if(data === true)return uncaughtFrozenStore(this).has(key);
        return data && $has(data, this._i);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var data = getWeak(anObject(key), true);
    if(data === true)uncaughtFrozenStore(that).set(key, value);
    else data[that._i] = value;
    return that;
  },
  ufstore: uncaughtFrozenStore
};
},{"12":12,"37":37,"39":39,"49":49,"6":6,"62":62,"7":7,"86":86}],22:[function(_dereq_,module,exports){
'use strict';
var global            = _dereq_(38)
  , $export           = _dereq_(32)
  , redefine          = _dereq_(87)
  , redefineAll       = _dereq_(86)
  , meta              = _dereq_(62)
  , forOf             = _dereq_(37)
  , anInstance        = _dereq_(6)
  , isObject          = _dereq_(49)
  , fails             = _dereq_(34)
  , $iterDetect       = _dereq_(54)
  , setToStringTag    = _dereq_(92)
  , inheritIfRequired = _dereq_(43);

module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
  var Base  = global[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  var fixMethod = function(KEY){
    var fn = proto[KEY];
    redefine(proto, KEY,
      KEY == 'delete' ? function(a){
        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'has' ? function has(a){
        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'get' ? function get(a){
        return IS_WEAK && !isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'add' ? function add(a){ fn.call(this, a === 0 ? 0 : a); return this; }
        : function set(a, b){ fn.call(this, a === 0 ? 0 : a, b); return this; }
    );
  };
  if(typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function(){
    new C().entries().next();
  }))){
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    var instance             = new C
      // early implementations not supports chaining
      , HASNT_CHAINING       = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance
      // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false
      , THROWS_ON_PRIMITIVES = fails(function(){ instance.has(1); })
      // most early implementations doesn't supports iterables, most modern - not close it correctly
      , ACCEPT_ITERABLES     = $iterDetect(function(iter){ new C(iter); }) // eslint-disable-line no-new
      // for early implementations -0 and +0 not the same
      , BUGGY_ZERO = !IS_WEAK && fails(function(){
        // V8 ~ Chromium 42- fails only with 5+ elements
        var $instance = new C()
          , index     = 5;
        while(index--)$instance[ADDER](index, index);
        return !$instance.has(-0);
      });
    if(!ACCEPT_ITERABLES){ 
      C = wrapper(function(target, iterable){
        anInstance(target, C, NAME);
        var that = inheritIfRequired(new Base, target, C);
        if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      });
      C.prototype = proto;
      proto.constructor = C;
    }
    if(THROWS_ON_PRIMITIVES || BUGGY_ZERO){
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    if(BUGGY_ZERO || HASNT_CHAINING)fixMethod(ADDER);
    // weak collections should not contains .clear method
    if(IS_WEAK && proto.clear)delete proto.clear;
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F * (C != Base), O);

  if(!IS_WEAK)common.setStrong(C, NAME, IS_MAP);

  return C;
};
},{"32":32,"34":34,"37":37,"38":38,"43":43,"49":49,"54":54,"6":6,"62":62,"86":86,"87":87,"92":92}],23:[function(_dereq_,module,exports){
var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],24:[function(_dereq_,module,exports){
'use strict';
var $defineProperty = _dereq_(67)
  , createDesc      = _dereq_(85);

module.exports = function(object, index, value){
  if(index in object)$defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};
},{"67":67,"85":85}],25:[function(_dereq_,module,exports){
// optional / simple context binding
var aFunction = _dereq_(3);
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"3":3}],26:[function(_dereq_,module,exports){
'use strict';
var anObject    = _dereq_(7)
  , toPrimitive = _dereq_(110)
  , NUMBER      = 'number';

module.exports = function(hint){
  if(hint !== 'string' && hint !== NUMBER && hint !== 'default')throw TypeError('Incorrect hint');
  return toPrimitive(anObject(this), hint != NUMBER);
};
},{"110":110,"7":7}],27:[function(_dereq_,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],28:[function(_dereq_,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !_dereq_(34)(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"34":34}],29:[function(_dereq_,module,exports){
var isObject = _dereq_(49)
  , document = _dereq_(38).document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"38":38,"49":49}],30:[function(_dereq_,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');
},{}],31:[function(_dereq_,module,exports){
// all enumerable object keys, includes symbols
var getKeys = _dereq_(76)
  , gOPS    = _dereq_(73)
  , pIE     = _dereq_(77);
module.exports = function(it){
  var result     = getKeys(it)
    , getSymbols = gOPS.f;
  if(getSymbols){
    var symbols = getSymbols(it)
      , isEnum  = pIE.f
      , i       = 0
      , key;
    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
  } return result;
};
},{"73":73,"76":76,"77":77}],32:[function(_dereq_,module,exports){
var global    = _dereq_(38)
  , core      = _dereq_(23)
  , hide      = _dereq_(40)
  , redefine  = _dereq_(87)
  , ctx       = _dereq_(25)
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE]
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE] || (exports[PROTOTYPE] = {})
    , key, own, out, exp;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if(target)redefine(target, key, out, type & $export.U);
    // export
    if(exports[key] != out)hide(exports, key, exp);
    if(IS_PROTO && expProto[key] != out)expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
module.exports = $export;
},{"23":23,"25":25,"38":38,"40":40,"87":87}],33:[function(_dereq_,module,exports){
var MATCH = _dereq_(117)('match');
module.exports = function(KEY){
  var re = /./;
  try {
    '/./'[KEY](re);
  } catch(e){
    try {
      re[MATCH] = false;
      return !'/./'[KEY](re);
    } catch(f){ /* empty */ }
  } return true;
};
},{"117":117}],34:[function(_dereq_,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],35:[function(_dereq_,module,exports){
'use strict';
var hide     = _dereq_(40)
  , redefine = _dereq_(87)
  , fails    = _dereq_(34)
  , defined  = _dereq_(27)
  , wks      = _dereq_(117);

module.exports = function(KEY, length, exec){
  var SYMBOL   = wks(KEY)
    , fns      = exec(defined, SYMBOL, ''[KEY])
    , strfn    = fns[0]
    , rxfn     = fns[1];
  if(fails(function(){
    var O = {};
    O[SYMBOL] = function(){ return 7; };
    return ''[KEY](O) != 7;
  })){
    redefine(String.prototype, KEY, strfn);
    hide(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function(string, arg){ return rxfn.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function(string){ return rxfn.call(string, this); }
    );
  }
};
},{"117":117,"27":27,"34":34,"40":40,"87":87}],36:[function(_dereq_,module,exports){
'use strict';
// 21.2.5.3 get RegExp.prototype.flags
var anObject = _dereq_(7);
module.exports = function(){
  var that   = anObject(this)
    , result = '';
  if(that.global)     result += 'g';
  if(that.ignoreCase) result += 'i';
  if(that.multiline)  result += 'm';
  if(that.unicode)    result += 'u';
  if(that.sticky)     result += 'y';
  return result;
};
},{"7":7}],37:[function(_dereq_,module,exports){
var ctx         = _dereq_(25)
  , call        = _dereq_(51)
  , isArrayIter = _dereq_(46)
  , anObject    = _dereq_(7)
  , toLength    = _dereq_(108)
  , getIterFn   = _dereq_(118)
  , BREAK       = {}
  , RETURN      = {};
var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator, result;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if(result === BREAK || result === RETURN)return result;
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    result = call(iterator, f, step.value, entries);
    if(result === BREAK || result === RETURN)return result;
  }
};
exports.BREAK  = BREAK;
exports.RETURN = RETURN;
},{"108":108,"118":118,"25":25,"46":46,"51":51,"7":7}],38:[function(_dereq_,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],39:[function(_dereq_,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],40:[function(_dereq_,module,exports){
var dP         = _dereq_(67)
  , createDesc = _dereq_(85);
module.exports = _dereq_(28) ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"28":28,"67":67,"85":85}],41:[function(_dereq_,module,exports){
module.exports = _dereq_(38).document && document.documentElement;
},{"38":38}],42:[function(_dereq_,module,exports){
module.exports = !_dereq_(28) && !_dereq_(34)(function(){
  return Object.defineProperty(_dereq_(29)('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"28":28,"29":29,"34":34}],43:[function(_dereq_,module,exports){
var isObject       = _dereq_(49)
  , setPrototypeOf = _dereq_(90).set;
module.exports = function(that, target, C){
  var P, S = target.constructor;
  if(S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && isObject(P) && setPrototypeOf){
    setPrototypeOf(that, P);
  } return that;
};
},{"49":49,"90":90}],44:[function(_dereq_,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return              fn.apply(that, args);
};
},{}],45:[function(_dereq_,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = _dereq_(18);
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"18":18}],46:[function(_dereq_,module,exports){
// check on default Array iterator
var Iterators  = _dereq_(56)
  , ITERATOR   = _dereq_(117)('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"117":117,"56":56}],47:[function(_dereq_,module,exports){
// 7.2.2 IsArray(argument)
var cof = _dereq_(18);
module.exports = Array.isArray || function isArray(arg){
  return cof(arg) == 'Array';
};
},{"18":18}],48:[function(_dereq_,module,exports){
// 20.1.2.3 Number.isInteger(number)
var isObject = _dereq_(49)
  , floor    = Math.floor;
module.exports = function isInteger(it){
  return !isObject(it) && isFinite(it) && floor(it) === it;
};
},{"49":49}],49:[function(_dereq_,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],50:[function(_dereq_,module,exports){
// 7.2.8 IsRegExp(argument)
var isObject = _dereq_(49)
  , cof      = _dereq_(18)
  , MATCH    = _dereq_(117)('match');
module.exports = function(it){
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == 'RegExp');
};
},{"117":117,"18":18,"49":49}],51:[function(_dereq_,module,exports){
// call something on iterator step with safe closing on error
var anObject = _dereq_(7);
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"7":7}],52:[function(_dereq_,module,exports){
'use strict';
var create         = _dereq_(66)
  , descriptor     = _dereq_(85)
  , setToStringTag = _dereq_(92)
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
_dereq_(40)(IteratorPrototype, _dereq_(117)('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"117":117,"40":40,"66":66,"85":85,"92":92}],53:[function(_dereq_,module,exports){
'use strict';
var LIBRARY        = _dereq_(58)
  , $export        = _dereq_(32)
  , redefine       = _dereq_(87)
  , hide           = _dereq_(40)
  , has            = _dereq_(39)
  , Iterators      = _dereq_(56)
  , $iterCreate    = _dereq_(52)
  , setToStringTag = _dereq_(92)
  , getPrototypeOf = _dereq_(74)
  , ITERATOR       = _dereq_(117)('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
    , methods, key, IteratorPrototype;
  // Fix native
  if($anyNative){
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
    if(IteratorPrototype !== Object.prototype){
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if(DEF_VALUES && $native && $native.name !== VALUES){
    VALUES_BUG = true;
    $default = function values(){ return $native.call(this); };
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES ? $default : getMethod(VALUES),
      keys:    IS_SET     ? $default : getMethod(KEYS),
      entries: $entries
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"117":117,"32":32,"39":39,"40":40,"52":52,"56":56,"58":58,"74":74,"87":87,"92":92}],54:[function(_dereq_,module,exports){
var ITERATOR     = _dereq_(117)('iterator')
  , SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }

module.exports = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR]();
    iter.next = function(){ return {done: safe = true}; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"117":117}],55:[function(_dereq_,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],56:[function(_dereq_,module,exports){
module.exports = {};
},{}],57:[function(_dereq_,module,exports){
var getKeys   = _dereq_(76)
  , toIObject = _dereq_(107);
module.exports = function(object, el){
  var O      = toIObject(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"107":107,"76":76}],58:[function(_dereq_,module,exports){
module.exports = false;
},{}],59:[function(_dereq_,module,exports){
// 20.2.2.14 Math.expm1(x)
var $expm1 = Math.expm1;
module.exports = (!$expm1
  // Old FF bug
  || $expm1(10) > 22025.465794806719 || $expm1(10) < 22025.4657948067165168
  // Tor Browser bug
  || $expm1(-2e-17) != -2e-17
) ? function expm1(x){
  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : Math.exp(x) - 1;
} : $expm1;
},{}],60:[function(_dereq_,module,exports){
// 20.2.2.20 Math.log1p(x)
module.exports = Math.log1p || function log1p(x){
  return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : Math.log(1 + x);
};
},{}],61:[function(_dereq_,module,exports){
// 20.2.2.28 Math.sign(x)
module.exports = Math.sign || function sign(x){
  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
};
},{}],62:[function(_dereq_,module,exports){
var META     = _dereq_(114)('meta')
  , isObject = _dereq_(49)
  , has      = _dereq_(39)
  , setDesc  = _dereq_(67).f
  , id       = 0;
var isExtensible = Object.isExtensible || function(){
  return true;
};
var FREEZE = !_dereq_(34)(function(){
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function(it){
  setDesc(it, META, {value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  }});
};
var fastKey = function(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add metadata
    if(!create)return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function(it, create){
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return true;
    // not necessary to add metadata
    if(!create)return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function(it){
  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY:      META,
  NEED:     false,
  fastKey:  fastKey,
  getWeak:  getWeak,
  onFreeze: onFreeze
};
},{"114":114,"34":34,"39":39,"49":49,"67":67}],63:[function(_dereq_,module,exports){
var Map     = _dereq_(149)
  , $export = _dereq_(32)
  , shared  = _dereq_(94)('metadata')
  , store   = shared.store || (shared.store = new (_dereq_(255)));

var getOrCreateMetadataMap = function(target, targetKey, create){
  var targetMetadata = store.get(target);
  if(!targetMetadata){
    if(!create)return undefined;
    store.set(target, targetMetadata = new Map);
  }
  var keyMetadata = targetMetadata.get(targetKey);
  if(!keyMetadata){
    if(!create)return undefined;
    targetMetadata.set(targetKey, keyMetadata = new Map);
  } return keyMetadata;
};
var ordinaryHasOwnMetadata = function(MetadataKey, O, P){
  var metadataMap = getOrCreateMetadataMap(O, P, false);
  return metadataMap === undefined ? false : metadataMap.has(MetadataKey);
};
var ordinaryGetOwnMetadata = function(MetadataKey, O, P){
  var metadataMap = getOrCreateMetadataMap(O, P, false);
  return metadataMap === undefined ? undefined : metadataMap.get(MetadataKey);
};
var ordinaryDefineOwnMetadata = function(MetadataKey, MetadataValue, O, P){
  getOrCreateMetadataMap(O, P, true).set(MetadataKey, MetadataValue);
};
var ordinaryOwnMetadataKeys = function(target, targetKey){
  var metadataMap = getOrCreateMetadataMap(target, targetKey, false)
    , keys        = [];
  if(metadataMap)metadataMap.forEach(function(_, key){ keys.push(key); });
  return keys;
};
var toMetaKey = function(it){
  return it === undefined || typeof it == 'symbol' ? it : String(it);
};
var exp = function(O){
  $export($export.S, 'Reflect', O);
};

module.exports = {
  store: store,
  map: getOrCreateMetadataMap,
  has: ordinaryHasOwnMetadata,
  get: ordinaryGetOwnMetadata,
  set: ordinaryDefineOwnMetadata,
  keys: ordinaryOwnMetadataKeys,
  key: toMetaKey,
  exp: exp
};
},{"149":149,"255":255,"32":32,"94":94}],64:[function(_dereq_,module,exports){
var global    = _dereq_(38)
  , macrotask = _dereq_(104).set
  , Observer  = global.MutationObserver || global.WebKitMutationObserver
  , process   = global.process
  , Promise   = global.Promise
  , isNode    = _dereq_(18)(process) == 'process';

module.exports = function(){
  var head, last, notify;

  var flush = function(){
    var parent, fn;
    if(isNode && (parent = process.domain))parent.exit();
    while(head){
      fn   = head.fn;
      head = head.next;
      try {
        fn();
      } catch(e){
        if(head)notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if(parent)parent.enter();
  };

  // Node.js
  if(isNode){
    notify = function(){
      process.nextTick(flush);
    };
  // browsers with MutationObserver
  } else if(Observer){
    var toggle = true
      , node   = document.createTextNode('');
    new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
    notify = function(){
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if(Promise && Promise.resolve){
    var promise = Promise.resolve();
    notify = function(){
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function(){
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function(fn){
    var task = {fn: fn, next: undefined};
    if(last)last.next = task;
    if(!head){
      head = task;
      notify();
    } last = task;
  };
};
},{"104":104,"18":18,"38":38}],65:[function(_dereq_,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var getKeys  = _dereq_(76)
  , gOPS     = _dereq_(73)
  , pIE      = _dereq_(77)
  , toObject = _dereq_(109)
  , IObject  = _dereq_(45)
  , $assign  = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || _dereq_(34)(function(){
  var A = {}
    , B = {}
    , S = Symbol()
    , K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function(k){ B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
  var T     = toObject(target)
    , aLen  = arguments.length
    , index = 1
    , getSymbols = gOPS.f
    , isEnum     = pIE.f;
  while(aLen > index){
    var S      = IObject(arguments[index++])
      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
  } return T;
} : $assign;
},{"109":109,"34":34,"45":45,"73":73,"76":76,"77":77}],66:[function(_dereq_,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject    = _dereq_(7)
  , dPs         = _dereq_(68)
  , enumBugKeys = _dereq_(30)
  , IE_PROTO    = _dereq_(93)('IE_PROTO')
  , Empty       = function(){ /* empty */ }
  , PROTOTYPE   = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = _dereq_(29)('iframe')
    , i      = enumBugKeys.length
    , lt     = '<'
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  _dereq_(41).appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties){
  var result;
  if(O !== null){
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty;
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"29":29,"30":30,"41":41,"68":68,"7":7,"93":93}],67:[function(_dereq_,module,exports){
var anObject       = _dereq_(7)
  , IE8_DOM_DEFINE = _dereq_(42)
  , toPrimitive    = _dereq_(110)
  , dP             = Object.defineProperty;

exports.f = _dereq_(28) ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};
},{"110":110,"28":28,"42":42,"7":7}],68:[function(_dereq_,module,exports){
var dP       = _dereq_(67)
  , anObject = _dereq_(7)
  , getKeys  = _dereq_(76);

module.exports = _dereq_(28) ? Object.defineProperties : function defineProperties(O, Properties){
  anObject(O);
  var keys   = getKeys(Properties)
    , length = keys.length
    , i = 0
    , P;
  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
  return O;
};
},{"28":28,"67":67,"7":7,"76":76}],69:[function(_dereq_,module,exports){
// Forced replacement prototype accessors methods
module.exports = _dereq_(58)|| !_dereq_(34)(function(){
  var K = Math.random();
  // In FF throws only define methods
  __defineSetter__.call(null, K, function(){ /* empty */});
  delete _dereq_(38)[K];
});
},{"34":34,"38":38,"58":58}],70:[function(_dereq_,module,exports){
var pIE            = _dereq_(77)
  , createDesc     = _dereq_(85)
  , toIObject      = _dereq_(107)
  , toPrimitive    = _dereq_(110)
  , has            = _dereq_(39)
  , IE8_DOM_DEFINE = _dereq_(42)
  , gOPD           = Object.getOwnPropertyDescriptor;

exports.f = _dereq_(28) ? gOPD : function getOwnPropertyDescriptor(O, P){
  O = toIObject(O);
  P = toPrimitive(P, true);
  if(IE8_DOM_DEFINE)try {
    return gOPD(O, P);
  } catch(e){ /* empty */ }
  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
};
},{"107":107,"110":110,"28":28,"39":39,"42":42,"77":77,"85":85}],71:[function(_dereq_,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = _dereq_(107)
  , gOPN      = _dereq_(72).f
  , toString  = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function(it){
  try {
    return gOPN(it);
  } catch(e){
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it){
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"107":107,"72":72}],72:[function(_dereq_,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys      = _dereq_(75)
  , hiddenKeys = _dereq_(30).concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
  return $keys(O, hiddenKeys);
};
},{"30":30,"75":75}],73:[function(_dereq_,module,exports){
exports.f = Object.getOwnPropertySymbols;
},{}],74:[function(_dereq_,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has         = _dereq_(39)
  , toObject    = _dereq_(109)
  , IE_PROTO    = _dereq_(93)('IE_PROTO')
  , ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function(O){
  O = toObject(O);
  if(has(O, IE_PROTO))return O[IE_PROTO];
  if(typeof O.constructor == 'function' && O instanceof O.constructor){
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};
},{"109":109,"39":39,"93":93}],75:[function(_dereq_,module,exports){
var has          = _dereq_(39)
  , toIObject    = _dereq_(107)
  , arrayIndexOf = _dereq_(11)(false)
  , IE_PROTO     = _dereq_(93)('IE_PROTO');

module.exports = function(object, names){
  var O      = toIObject(object)
    , i      = 0
    , result = []
    , key;
  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while(names.length > i)if(has(O, key = names[i++])){
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};
},{"107":107,"11":11,"39":39,"93":93}],76:[function(_dereq_,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys       = _dereq_(75)
  , enumBugKeys = _dereq_(30);

module.exports = Object.keys || function keys(O){
  return $keys(O, enumBugKeys);
};
},{"30":30,"75":75}],77:[function(_dereq_,module,exports){
exports.f = {}.propertyIsEnumerable;
},{}],78:[function(_dereq_,module,exports){
// most Object methods by ES6 should accept primitives
var $export = _dereq_(32)
  , core    = _dereq_(23)
  , fails   = _dereq_(34);
module.exports = function(KEY, exec){
  var fn  = (core.Object || {})[KEY] || Object[KEY]
    , exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
};
},{"23":23,"32":32,"34":34}],79:[function(_dereq_,module,exports){
var getKeys   = _dereq_(76)
  , toIObject = _dereq_(107)
  , isEnum    = _dereq_(77).f;
module.exports = function(isEntries){
  return function(it){
    var O      = toIObject(it)
      , keys   = getKeys(O)
      , length = keys.length
      , i      = 0
      , result = []
      , key;
    while(length > i)if(isEnum.call(O, key = keys[i++])){
      result.push(isEntries ? [key, O[key]] : O[key]);
    } return result;
  };
};
},{"107":107,"76":76,"77":77}],80:[function(_dereq_,module,exports){
// all object keys, includes non-enumerable and symbols
var gOPN     = _dereq_(72)
  , gOPS     = _dereq_(73)
  , anObject = _dereq_(7)
  , Reflect  = _dereq_(38).Reflect;
module.exports = Reflect && Reflect.ownKeys || function ownKeys(it){
  var keys       = gOPN.f(anObject(it))
    , getSymbols = gOPS.f;
  return getSymbols ? keys.concat(getSymbols(it)) : keys;
};
},{"38":38,"7":7,"72":72,"73":73}],81:[function(_dereq_,module,exports){
var $parseFloat = _dereq_(38).parseFloat
  , $trim       = _dereq_(102).trim;

module.exports = 1 / $parseFloat(_dereq_(103) + '-0') !== -Infinity ? function parseFloat(str){
  var string = $trim(String(str), 3)
    , result = $parseFloat(string);
  return result === 0 && string.charAt(0) == '-' ? -0 : result;
} : $parseFloat;
},{"102":102,"103":103,"38":38}],82:[function(_dereq_,module,exports){
var $parseInt = _dereq_(38).parseInt
  , $trim     = _dereq_(102).trim
  , ws        = _dereq_(103)
  , hex       = /^[\-+]?0[xX]/;

module.exports = $parseInt(ws + '08') !== 8 || $parseInt(ws + '0x16') !== 22 ? function parseInt(str, radix){
  var string = $trim(String(str), 3);
  return $parseInt(string, (radix >>> 0) || (hex.test(string) ? 16 : 10));
} : $parseInt;
},{"102":102,"103":103,"38":38}],83:[function(_dereq_,module,exports){
'use strict';
var path      = _dereq_(84)
  , invoke    = _dereq_(44)
  , aFunction = _dereq_(3);
module.exports = function(/* ...pargs */){
  var fn     = aFunction(this)
    , length = arguments.length
    , pargs  = Array(length)
    , i      = 0
    , _      = path._
    , holder = false;
  while(length > i)if((pargs[i] = arguments[i++]) === _)holder = true;
  return function(/* ...args */){
    var that = this
      , aLen = arguments.length
      , j = 0, k = 0, args;
    if(!holder && !aLen)return invoke(fn, pargs, that);
    args = pargs.slice();
    if(holder)for(;length > j; j++)if(args[j] === _)args[j] = arguments[k++];
    while(aLen > k)args.push(arguments[k++]);
    return invoke(fn, args, that);
  };
};
},{"3":3,"44":44,"84":84}],84:[function(_dereq_,module,exports){
module.exports = _dereq_(38);
},{"38":38}],85:[function(_dereq_,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],86:[function(_dereq_,module,exports){
var redefine = _dereq_(87);
module.exports = function(target, src, safe){
  for(var key in src)redefine(target, key, src[key], safe);
  return target;
};
},{"87":87}],87:[function(_dereq_,module,exports){
var global    = _dereq_(38)
  , hide      = _dereq_(40)
  , has       = _dereq_(39)
  , SRC       = _dereq_(114)('src')
  , TO_STRING = 'toString'
  , $toString = Function[TO_STRING]
  , TPL       = ('' + $toString).split(TO_STRING);

_dereq_(23).inspectSource = function(it){
  return $toString.call(it);
};

(module.exports = function(O, key, val, safe){
  var isFunction = typeof val == 'function';
  if(isFunction)has(val, 'name') || hide(val, 'name', key);
  if(O[key] === val)return;
  if(isFunction)has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if(O === global){
    O[key] = val;
  } else {
    if(!safe){
      delete O[key];
      hide(O, key, val);
    } else {
      if(O[key])O[key] = val;
      else hide(O, key, val);
    }
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString(){
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});
},{"114":114,"23":23,"38":38,"39":39,"40":40}],88:[function(_dereq_,module,exports){
module.exports = function(regExp, replace){
  var replacer = replace === Object(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(it).replace(regExp, replacer);
  };
};
},{}],89:[function(_dereq_,module,exports){
// 7.2.9 SameValue(x, y)
module.exports = Object.is || function is(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};
},{}],90:[function(_dereq_,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = _dereq_(49)
  , anObject = _dereq_(7);
var check = function(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function(test, buggy, set){
      try {
        set = _dereq_(25)(Function.call, _dereq_(70).f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch(e){ buggy = true; }
      return function setPrototypeOf(O, proto){
        check(O, proto);
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};
},{"25":25,"49":49,"7":7,"70":70}],91:[function(_dereq_,module,exports){
'use strict';
var global      = _dereq_(38)
  , dP          = _dereq_(67)
  , DESCRIPTORS = _dereq_(28)
  , SPECIES     = _dereq_(117)('species');

module.exports = function(KEY){
  var C = global[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"117":117,"28":28,"38":38,"67":67}],92:[function(_dereq_,module,exports){
var def = _dereq_(67).f
  , has = _dereq_(39)
  , TAG = _dereq_(117)('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"117":117,"39":39,"67":67}],93:[function(_dereq_,module,exports){
var shared = _dereq_(94)('keys')
  , uid    = _dereq_(114);
module.exports = function(key){
  return shared[key] || (shared[key] = uid(key));
};
},{"114":114,"94":94}],94:[function(_dereq_,module,exports){
var global = _dereq_(38)
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"38":38}],95:[function(_dereq_,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject  = _dereq_(7)
  , aFunction = _dereq_(3)
  , SPECIES   = _dereq_(117)('species');
module.exports = function(O, D){
  var C = anObject(O).constructor, S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};
},{"117":117,"3":3,"7":7}],96:[function(_dereq_,module,exports){
var fails = _dereq_(34);

module.exports = function(method, arg){
  return !!method && fails(function(){
    arg ? method.call(null, function(){}, 1) : method.call(null);
  });
};
},{"34":34}],97:[function(_dereq_,module,exports){
var toInteger = _dereq_(106)
  , defined   = _dereq_(27);
// true  -> String#at
// false -> String#codePointAt
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"106":106,"27":27}],98:[function(_dereq_,module,exports){
// helper for String#{startsWith, endsWith, includes}
var isRegExp = _dereq_(50)
  , defined  = _dereq_(27);

module.exports = function(that, searchString, NAME){
  if(isRegExp(searchString))throw TypeError('String#' + NAME + " doesn't accept regex!");
  return String(defined(that));
};
},{"27":27,"50":50}],99:[function(_dereq_,module,exports){
var $export = _dereq_(32)
  , fails   = _dereq_(34)
  , defined = _dereq_(27)
  , quot    = /"/g;
// B.2.3.2.1 CreateHTML(string, tag, attribute, value)
var createHTML = function(string, tag, attribute, value) {
  var S  = String(defined(string))
    , p1 = '<' + tag;
  if(attribute !== '')p1 += ' ' + attribute + '="' + String(value).replace(quot, '&quot;') + '"';
  return p1 + '>' + S + '</' + tag + '>';
};
module.exports = function(NAME, exec){
  var O = {};
  O[NAME] = exec(createHTML);
  $export($export.P + $export.F * fails(function(){
    var test = ''[NAME]('"');
    return test !== test.toLowerCase() || test.split('"').length > 3;
  }), 'String', O);
};
},{"27":27,"32":32,"34":34}],100:[function(_dereq_,module,exports){
// https://github.com/tc39/proposal-string-pad-start-end
var toLength = _dereq_(108)
  , repeat   = _dereq_(101)
  , defined  = _dereq_(27);

module.exports = function(that, maxLength, fillString, left){
  var S            = String(defined(that))
    , stringLength = S.length
    , fillStr      = fillString === undefined ? ' ' : String(fillString)
    , intMaxLength = toLength(maxLength);
  if(intMaxLength <= stringLength || fillStr == '')return S;
  var fillLen = intMaxLength - stringLength
    , stringFiller = repeat.call(fillStr, Math.ceil(fillLen / fillStr.length));
  if(stringFiller.length > fillLen)stringFiller = stringFiller.slice(0, fillLen);
  return left ? stringFiller + S : S + stringFiller;
};

},{"101":101,"108":108,"27":27}],101:[function(_dereq_,module,exports){
'use strict';
var toInteger = _dereq_(106)
  , defined   = _dereq_(27);

module.exports = function repeat(count){
  var str = String(defined(this))
    , res = ''
    , n   = toInteger(count);
  if(n < 0 || n == Infinity)throw RangeError("Count can't be negative");
  for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
  return res;
};
},{"106":106,"27":27}],102:[function(_dereq_,module,exports){
var $export = _dereq_(32)
  , defined = _dereq_(27)
  , fails   = _dereq_(34)
  , spaces  = _dereq_(103)
  , space   = '[' + spaces + ']'
  , non     = '\u200b\u0085'
  , ltrim   = RegExp('^' + space + space + '*')
  , rtrim   = RegExp(space + space + '*$');

var exporter = function(KEY, exec, ALIAS){
  var exp   = {};
  var FORCE = fails(function(){
    return !!spaces[KEY]() || non[KEY]() != non;
  });
  var fn = exp[KEY] = FORCE ? exec(trim) : spaces[KEY];
  if(ALIAS)exp[ALIAS] = fn;
  $export($export.P + $export.F * FORCE, 'String', exp);
};

// 1 -> String#trimLeft
// 2 -> String#trimRight
// 3 -> String#trim
var trim = exporter.trim = function(string, TYPE){
  string = String(defined(string));
  if(TYPE & 1)string = string.replace(ltrim, '');
  if(TYPE & 2)string = string.replace(rtrim, '');
  return string;
};

module.exports = exporter;
},{"103":103,"27":27,"32":32,"34":34}],103:[function(_dereq_,module,exports){
module.exports = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
  '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';
},{}],104:[function(_dereq_,module,exports){
var ctx                = _dereq_(25)
  , invoke             = _dereq_(44)
  , html               = _dereq_(41)
  , cel                = _dereq_(29)
  , global             = _dereq_(38)
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
var run = function(){
  var id = +this;
  if(queue.hasOwnProperty(id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function(event){
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!setTask || !clearTask){
  setTask = function setImmediate(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(_dereq_(18)(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if(MessageChannel){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
    defer = function(id){
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"18":18,"25":25,"29":29,"38":38,"41":41,"44":44}],105:[function(_dereq_,module,exports){
var toInteger = _dereq_(106)
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"106":106}],106:[function(_dereq_,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],107:[function(_dereq_,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = _dereq_(45)
  , defined = _dereq_(27);
module.exports = function(it){
  return IObject(defined(it));
};
},{"27":27,"45":45}],108:[function(_dereq_,module,exports){
// 7.1.15 ToLength
var toInteger = _dereq_(106)
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"106":106}],109:[function(_dereq_,module,exports){
// 7.1.13 ToObject(argument)
var defined = _dereq_(27);
module.exports = function(it){
  return Object(defined(it));
};
},{"27":27}],110:[function(_dereq_,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = _dereq_(49);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};
},{"49":49}],111:[function(_dereq_,module,exports){
'use strict';
if(_dereq_(28)){
  var LIBRARY             = _dereq_(58)
    , global              = _dereq_(38)
    , fails               = _dereq_(34)
    , $export             = _dereq_(32)
    , $typed              = _dereq_(113)
    , $buffer             = _dereq_(112)
    , ctx                 = _dereq_(25)
    , anInstance          = _dereq_(6)
    , propertyDesc        = _dereq_(85)
    , hide                = _dereq_(40)
    , redefineAll         = _dereq_(86)
    , toInteger           = _dereq_(106)
    , toLength            = _dereq_(108)
    , toIndex             = _dereq_(105)
    , toPrimitive         = _dereq_(110)
    , has                 = _dereq_(39)
    , same                = _dereq_(89)
    , classof             = _dereq_(17)
    , isObject            = _dereq_(49)
    , toObject            = _dereq_(109)
    , isArrayIter         = _dereq_(46)
    , create              = _dereq_(66)
    , getPrototypeOf      = _dereq_(74)
    , gOPN                = _dereq_(72).f
    , getIterFn           = _dereq_(118)
    , uid                 = _dereq_(114)
    , wks                 = _dereq_(117)
    , createArrayMethod   = _dereq_(12)
    , createArrayIncludes = _dereq_(11)
    , speciesConstructor  = _dereq_(95)
    , ArrayIterators      = _dereq_(130)
    , Iterators           = _dereq_(56)
    , $iterDetect         = _dereq_(54)
    , setSpecies          = _dereq_(91)
    , arrayFill           = _dereq_(9)
    , arrayCopyWithin     = _dereq_(8)
    , $DP                 = _dereq_(67)
    , $GOPD               = _dereq_(70)
    , dP                  = $DP.f
    , gOPD                = $GOPD.f
    , RangeError          = global.RangeError
    , TypeError           = global.TypeError
    , Uint8Array          = global.Uint8Array
    , ARRAY_BUFFER        = 'ArrayBuffer'
    , SHARED_BUFFER       = 'Shared' + ARRAY_BUFFER
    , BYTES_PER_ELEMENT   = 'BYTES_PER_ELEMENT'
    , PROTOTYPE           = 'prototype'
    , ArrayProto          = Array[PROTOTYPE]
    , $ArrayBuffer        = $buffer.ArrayBuffer
    , $DataView           = $buffer.DataView
    , arrayForEach        = createArrayMethod(0)
    , arrayFilter         = createArrayMethod(2)
    , arraySome           = createArrayMethod(3)
    , arrayEvery          = createArrayMethod(4)
    , arrayFind           = createArrayMethod(5)
    , arrayFindIndex      = createArrayMethod(6)
    , arrayIncludes       = createArrayIncludes(true)
    , arrayIndexOf        = createArrayIncludes(false)
    , arrayValues         = ArrayIterators.values
    , arrayKeys           = ArrayIterators.keys
    , arrayEntries        = ArrayIterators.entries
    , arrayLastIndexOf    = ArrayProto.lastIndexOf
    , arrayReduce         = ArrayProto.reduce
    , arrayReduceRight    = ArrayProto.reduceRight
    , arrayJoin           = ArrayProto.join
    , arraySort           = ArrayProto.sort
    , arraySlice          = ArrayProto.slice
    , arrayToString       = ArrayProto.toString
    , arrayToLocaleString = ArrayProto.toLocaleString
    , ITERATOR            = wks('iterator')
    , TAG                 = wks('toStringTag')
    , TYPED_CONSTRUCTOR   = uid('typed_constructor')
    , DEF_CONSTRUCTOR     = uid('def_constructor')
    , ALL_CONSTRUCTORS    = $typed.CONSTR
    , TYPED_ARRAY         = $typed.TYPED
    , VIEW                = $typed.VIEW
    , WRONG_LENGTH        = 'Wrong length!';

  var $map = createArrayMethod(1, function(O, length){
    return allocate(speciesConstructor(O, O[DEF_CONSTRUCTOR]), length);
  });

  var LITTLE_ENDIAN = fails(function(){
    return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
  });

  var FORCED_SET = !!Uint8Array && !!Uint8Array[PROTOTYPE].set && fails(function(){
    new Uint8Array(1).set({});
  });

  var strictToLength = function(it, SAME){
    if(it === undefined)throw TypeError(WRONG_LENGTH);
    var number = +it
      , length = toLength(it);
    if(SAME && !same(number, length))throw RangeError(WRONG_LENGTH);
    return length;
  };

  var toOffset = function(it, BYTES){
    var offset = toInteger(it);
    if(offset < 0 || offset % BYTES)throw RangeError('Wrong offset!');
    return offset;
  };

  var validate = function(it){
    if(isObject(it) && TYPED_ARRAY in it)return it;
    throw TypeError(it + ' is not a typed array!');
  };

  var allocate = function(C, length){
    if(!(isObject(C) && TYPED_CONSTRUCTOR in C)){
      throw TypeError('It is not a typed array constructor!');
    } return new C(length);
  };

  var speciesFromList = function(O, list){
    return fromList(speciesConstructor(O, O[DEF_CONSTRUCTOR]), list);
  };

  var fromList = function(C, list){
    var index  = 0
      , length = list.length
      , result = allocate(C, length);
    while(length > index)result[index] = list[index++];
    return result;
  };

  var addGetter = function(it, key, internal){
    dP(it, key, {get: function(){ return this._d[internal]; }});
  };

  var $from = function from(source /*, mapfn, thisArg */){
    var O       = toObject(source)
      , aLen    = arguments.length
      , mapfn   = aLen > 1 ? arguments[1] : undefined
      , mapping = mapfn !== undefined
      , iterFn  = getIterFn(O)
      , i, length, values, result, step, iterator;
    if(iterFn != undefined && !isArrayIter(iterFn)){
      for(iterator = iterFn.call(O), values = [], i = 0; !(step = iterator.next()).done; i++){
        values.push(step.value);
      } O = values;
    }
    if(mapping && aLen > 2)mapfn = ctx(mapfn, arguments[2], 2);
    for(i = 0, length = toLength(O.length), result = allocate(this, length); length > i; i++){
      result[i] = mapping ? mapfn(O[i], i) : O[i];
    }
    return result;
  };

  var $of = function of(/*...items*/){
    var index  = 0
      , length = arguments.length
      , result = allocate(this, length);
    while(length > index)result[index] = arguments[index++];
    return result;
  };

  // iOS Safari 6.x fails here
  var TO_LOCALE_BUG = !!Uint8Array && fails(function(){ arrayToLocaleString.call(new Uint8Array(1)); });

  var $toLocaleString = function toLocaleString(){
    return arrayToLocaleString.apply(TO_LOCALE_BUG ? arraySlice.call(validate(this)) : validate(this), arguments);
  };

  var proto = {
    copyWithin: function copyWithin(target, start /*, end */){
      return arrayCopyWithin.call(validate(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
    },
    every: function every(callbackfn /*, thisArg */){
      return arrayEvery(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    fill: function fill(value /*, start, end */){ // eslint-disable-line no-unused-vars
      return arrayFill.apply(validate(this), arguments);
    },
    filter: function filter(callbackfn /*, thisArg */){
      return speciesFromList(this, arrayFilter(validate(this), callbackfn,
        arguments.length > 1 ? arguments[1] : undefined));
    },
    find: function find(predicate /*, thisArg */){
      return arrayFind(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
    },
    findIndex: function findIndex(predicate /*, thisArg */){
      return arrayFindIndex(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
    },
    forEach: function forEach(callbackfn /*, thisArg */){
      arrayForEach(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    indexOf: function indexOf(searchElement /*, fromIndex */){
      return arrayIndexOf(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
    },
    includes: function includes(searchElement /*, fromIndex */){
      return arrayIncludes(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
    },
    join: function join(separator){ // eslint-disable-line no-unused-vars
      return arrayJoin.apply(validate(this), arguments);
    },
    lastIndexOf: function lastIndexOf(searchElement /*, fromIndex */){ // eslint-disable-line no-unused-vars
      return arrayLastIndexOf.apply(validate(this), arguments);
    },
    map: function map(mapfn /*, thisArg */){
      return $map(validate(this), mapfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    reduce: function reduce(callbackfn /*, initialValue */){ // eslint-disable-line no-unused-vars
      return arrayReduce.apply(validate(this), arguments);
    },
    reduceRight: function reduceRight(callbackfn /*, initialValue */){ // eslint-disable-line no-unused-vars
      return arrayReduceRight.apply(validate(this), arguments);
    },
    reverse: function reverse(){
      var that   = this
        , length = validate(that).length
        , middle = Math.floor(length / 2)
        , index  = 0
        , value;
      while(index < middle){
        value         = that[index];
        that[index++] = that[--length];
        that[length]  = value;
      } return that;
    },
    some: function some(callbackfn /*, thisArg */){
      return arraySome(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    sort: function sort(comparefn){
      return arraySort.call(validate(this), comparefn);
    },
    subarray: function subarray(begin, end){
      var O      = validate(this)
        , length = O.length
        , $begin = toIndex(begin, length);
      return new (speciesConstructor(O, O[DEF_CONSTRUCTOR]))(
        O.buffer,
        O.byteOffset + $begin * O.BYTES_PER_ELEMENT,
        toLength((end === undefined ? length : toIndex(end, length)) - $begin)
      );
    }
  };

  var $slice = function slice(start, end){
    return speciesFromList(this, arraySlice.call(validate(this), start, end));
  };

  var $set = function set(arrayLike /*, offset */){
    validate(this);
    var offset = toOffset(arguments[1], 1)
      , length = this.length
      , src    = toObject(arrayLike)
      , len    = toLength(src.length)
      , index  = 0;
    if(len + offset > length)throw RangeError(WRONG_LENGTH);
    while(index < len)this[offset + index] = src[index++];
  };

  var $iterators = {
    entries: function entries(){
      return arrayEntries.call(validate(this));
    },
    keys: function keys(){
      return arrayKeys.call(validate(this));
    },
    values: function values(){
      return arrayValues.call(validate(this));
    }
  };

  var isTAIndex = function(target, key){
    return isObject(target)
      && target[TYPED_ARRAY]
      && typeof key != 'symbol'
      && key in target
      && String(+key) == String(key);
  };
  var $getDesc = function getOwnPropertyDescriptor(target, key){
    return isTAIndex(target, key = toPrimitive(key, true))
      ? propertyDesc(2, target[key])
      : gOPD(target, key);
  };
  var $setDesc = function defineProperty(target, key, desc){
    if(isTAIndex(target, key = toPrimitive(key, true))
      && isObject(desc)
      && has(desc, 'value')
      && !has(desc, 'get')
      && !has(desc, 'set')
      // TODO: add validation descriptor w/o calling accessors
      && !desc.configurable
      && (!has(desc, 'writable') || desc.writable)
      && (!has(desc, 'enumerable') || desc.enumerable)
    ){
      target[key] = desc.value;
      return target;
    } else return dP(target, key, desc);
  };

  if(!ALL_CONSTRUCTORS){
    $GOPD.f = $getDesc;
    $DP.f   = $setDesc;
  }

  $export($export.S + $export.F * !ALL_CONSTRUCTORS, 'Object', {
    getOwnPropertyDescriptor: $getDesc,
    defineProperty:           $setDesc
  });

  if(fails(function(){ arrayToString.call({}); })){
    arrayToString = arrayToLocaleString = function toString(){
      return arrayJoin.call(this);
    }
  }

  var $TypedArrayPrototype$ = redefineAll({}, proto);
  redefineAll($TypedArrayPrototype$, $iterators);
  hide($TypedArrayPrototype$, ITERATOR, $iterators.values);
  redefineAll($TypedArrayPrototype$, {
    slice:          $slice,
    set:            $set,
    constructor:    function(){ /* noop */ },
    toString:       arrayToString,
    toLocaleString: $toLocaleString
  });
  addGetter($TypedArrayPrototype$, 'buffer', 'b');
  addGetter($TypedArrayPrototype$, 'byteOffset', 'o');
  addGetter($TypedArrayPrototype$, 'byteLength', 'l');
  addGetter($TypedArrayPrototype$, 'length', 'e');
  dP($TypedArrayPrototype$, TAG, {
    get: function(){ return this[TYPED_ARRAY]; }
  });

  module.exports = function(KEY, BYTES, wrapper, CLAMPED){
    CLAMPED = !!CLAMPED;
    var NAME       = KEY + (CLAMPED ? 'Clamped' : '') + 'Array'
      , ISNT_UINT8 = NAME != 'Uint8Array'
      , GETTER     = 'get' + KEY
      , SETTER     = 'set' + KEY
      , TypedArray = global[NAME]
      , Base       = TypedArray || {}
      , TAC        = TypedArray && getPrototypeOf(TypedArray)
      , FORCED     = !TypedArray || !$typed.ABV
      , O          = {}
      , TypedArrayPrototype = TypedArray && TypedArray[PROTOTYPE];
    var getter = function(that, index){
      var data = that._d;
      return data.v[GETTER](index * BYTES + data.o, LITTLE_ENDIAN);
    };
    var setter = function(that, index, value){
      var data = that._d;
      if(CLAMPED)value = (value = Math.round(value)) < 0 ? 0 : value > 0xff ? 0xff : value & 0xff;
      data.v[SETTER](index * BYTES + data.o, value, LITTLE_ENDIAN);
    };
    var addElement = function(that, index){
      dP(that, index, {
        get: function(){
          return getter(this, index);
        },
        set: function(value){
          return setter(this, index, value);
        },
        enumerable: true
      });
    };
    if(FORCED){
      TypedArray = wrapper(function(that, data, $offset, $length){
        anInstance(that, TypedArray, NAME, '_d');
        var index  = 0
          , offset = 0
          , buffer, byteLength, length, klass;
        if(!isObject(data)){
          length     = strictToLength(data, true)
          byteLength = length * BYTES;
          buffer     = new $ArrayBuffer(byteLength);
        } else if(data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER){
          buffer = data;
          offset = toOffset($offset, BYTES);
          var $len = data.byteLength;
          if($length === undefined){
            if($len % BYTES)throw RangeError(WRONG_LENGTH);
            byteLength = $len - offset;
            if(byteLength < 0)throw RangeError(WRONG_LENGTH);
          } else {
            byteLength = toLength($length) * BYTES;
            if(byteLength + offset > $len)throw RangeError(WRONG_LENGTH);
          }
          length = byteLength / BYTES;
        } else if(TYPED_ARRAY in data){
          return fromList(TypedArray, data);
        } else {
          return $from.call(TypedArray, data);
        }
        hide(that, '_d', {
          b: buffer,
          o: offset,
          l: byteLength,
          e: length,
          v: new $DataView(buffer)
        });
        while(index < length)addElement(that, index++);
      });
      TypedArrayPrototype = TypedArray[PROTOTYPE] = create($TypedArrayPrototype$);
      hide(TypedArrayPrototype, 'constructor', TypedArray);
    } else if(!$iterDetect(function(iter){
      // V8 works with iterators, but fails in many other cases
      // https://code.google.com/p/v8/issues/detail?id=4552
      new TypedArray(null); // eslint-disable-line no-new
      new TypedArray(iter); // eslint-disable-line no-new
    }, true)){
      TypedArray = wrapper(function(that, data, $offset, $length){
        anInstance(that, TypedArray, NAME);
        var klass;
        // `ws` module bug, temporarily remove validation length for Uint8Array
        // https://github.com/websockets/ws/pull/645
        if(!isObject(data))return new Base(strictToLength(data, ISNT_UINT8));
        if(data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER){
          return $length !== undefined
            ? new Base(data, toOffset($offset, BYTES), $length)
            : $offset !== undefined
              ? new Base(data, toOffset($offset, BYTES))
              : new Base(data);
        }
        if(TYPED_ARRAY in data)return fromList(TypedArray, data);
        return $from.call(TypedArray, data);
      });
      arrayForEach(TAC !== Function.prototype ? gOPN(Base).concat(gOPN(TAC)) : gOPN(Base), function(key){
        if(!(key in TypedArray))hide(TypedArray, key, Base[key]);
      });
      TypedArray[PROTOTYPE] = TypedArrayPrototype;
      if(!LIBRARY)TypedArrayPrototype.constructor = TypedArray;
    }
    var $nativeIterator   = TypedArrayPrototype[ITERATOR]
      , CORRECT_ITER_NAME = !!$nativeIterator && ($nativeIterator.name == 'values' || $nativeIterator.name == undefined)
      , $iterator         = $iterators.values;
    hide(TypedArray, TYPED_CONSTRUCTOR, true);
    hide(TypedArrayPrototype, TYPED_ARRAY, NAME);
    hide(TypedArrayPrototype, VIEW, true);
    hide(TypedArrayPrototype, DEF_CONSTRUCTOR, TypedArray);

    if(CLAMPED ? new TypedArray(1)[TAG] != NAME : !(TAG in TypedArrayPrototype)){
      dP(TypedArrayPrototype, TAG, {
        get: function(){ return NAME; }
      });
    }

    O[NAME] = TypedArray;

    $export($export.G + $export.W + $export.F * (TypedArray != Base), O);

    $export($export.S, NAME, {
      BYTES_PER_ELEMENT: BYTES,
      from: $from,
      of: $of
    });

    if(!(BYTES_PER_ELEMENT in TypedArrayPrototype))hide(TypedArrayPrototype, BYTES_PER_ELEMENT, BYTES);

    $export($export.P, NAME, proto);

    setSpecies(NAME);

    $export($export.P + $export.F * FORCED_SET, NAME, {set: $set});

    $export($export.P + $export.F * !CORRECT_ITER_NAME, NAME, $iterators);

    $export($export.P + $export.F * (TypedArrayPrototype.toString != arrayToString), NAME, {toString: arrayToString});

    $export($export.P + $export.F * fails(function(){
      new TypedArray(1).slice();
    }), NAME, {slice: $slice});

    $export($export.P + $export.F * (fails(function(){
      return [1, 2].toLocaleString() != new TypedArray([1, 2]).toLocaleString()
    }) || !fails(function(){
      TypedArrayPrototype.toLocaleString.call([1, 2]);
    })), NAME, {toLocaleString: $toLocaleString});

    Iterators[NAME] = CORRECT_ITER_NAME ? $nativeIterator : $iterator;
    if(!LIBRARY && !CORRECT_ITER_NAME)hide(TypedArrayPrototype, ITERATOR, $iterator);
  };
} else module.exports = function(){ /* empty */ };
},{"105":105,"106":106,"108":108,"109":109,"11":11,"110":110,"112":112,"113":113,"114":114,"117":117,"118":118,"12":12,"130":130,"17":17,"25":25,"28":28,"32":32,"34":34,"38":38,"39":39,"40":40,"46":46,"49":49,"54":54,"56":56,"58":58,"6":6,"66":66,"67":67,"70":70,"72":72,"74":74,"8":8,"85":85,"86":86,"89":89,"9":9,"91":91,"95":95}],112:[function(_dereq_,module,exports){
'use strict';
var global         = _dereq_(38)
  , DESCRIPTORS    = _dereq_(28)
  , LIBRARY        = _dereq_(58)
  , $typed         = _dereq_(113)
  , hide           = _dereq_(40)
  , redefineAll    = _dereq_(86)
  , fails          = _dereq_(34)
  , anInstance     = _dereq_(6)
  , toInteger      = _dereq_(106)
  , toLength       = _dereq_(108)
  , gOPN           = _dereq_(72).f
  , dP             = _dereq_(67).f
  , arrayFill      = _dereq_(9)
  , setToStringTag = _dereq_(92)
  , ARRAY_BUFFER   = 'ArrayBuffer'
  , DATA_VIEW      = 'DataView'
  , PROTOTYPE      = 'prototype'
  , WRONG_LENGTH   = 'Wrong length!'
  , WRONG_INDEX    = 'Wrong index!'
  , $ArrayBuffer   = global[ARRAY_BUFFER]
  , $DataView      = global[DATA_VIEW]
  , Math           = global.Math
  , RangeError     = global.RangeError
  , Infinity       = global.Infinity
  , BaseBuffer     = $ArrayBuffer
  , abs            = Math.abs
  , pow            = Math.pow
  , floor          = Math.floor
  , log            = Math.log
  , LN2            = Math.LN2
  , BUFFER         = 'buffer'
  , BYTE_LENGTH    = 'byteLength'
  , BYTE_OFFSET    = 'byteOffset'
  , $BUFFER        = DESCRIPTORS ? '_b' : BUFFER
  , $LENGTH        = DESCRIPTORS ? '_l' : BYTE_LENGTH
  , $OFFSET        = DESCRIPTORS ? '_o' : BYTE_OFFSET;

// IEEE754 conversions based on https://github.com/feross/ieee754
var packIEEE754 = function(value, mLen, nBytes){
  var buffer = Array(nBytes)
    , eLen   = nBytes * 8 - mLen - 1
    , eMax   = (1 << eLen) - 1
    , eBias  = eMax >> 1
    , rt     = mLen === 23 ? pow(2, -24) - pow(2, -77) : 0
    , i      = 0
    , s      = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0
    , e, m, c;
  value = abs(value)
  if(value != value || value === Infinity){
    m = value != value ? 1 : 0;
    e = eMax;
  } else {
    e = floor(log(value) / LN2);
    if(value * (c = pow(2, -e)) < 1){
      e--;
      c *= 2;
    }
    if(e + eBias >= 1){
      value += rt / c;
    } else {
      value += rt * pow(2, 1 - eBias);
    }
    if(value * c >= 2){
      e++;
      c /= 2;
    }
    if(e + eBias >= eMax){
      m = 0;
      e = eMax;
    } else if(e + eBias >= 1){
      m = (value * c - 1) * pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * pow(2, eBias - 1) * pow(2, mLen);
      e = 0;
    }
  }
  for(; mLen >= 8; buffer[i++] = m & 255, m /= 256, mLen -= 8);
  e = e << mLen | m;
  eLen += mLen;
  for(; eLen > 0; buffer[i++] = e & 255, e /= 256, eLen -= 8);
  buffer[--i] |= s * 128;
  return buffer;
};
var unpackIEEE754 = function(buffer, mLen, nBytes){
  var eLen  = nBytes * 8 - mLen - 1
    , eMax  = (1 << eLen) - 1
    , eBias = eMax >> 1
    , nBits = eLen - 7
    , i     = nBytes - 1
    , s     = buffer[i--]
    , e     = s & 127
    , m;
  s >>= 7;
  for(; nBits > 0; e = e * 256 + buffer[i], i--, nBits -= 8);
  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;
  for(; nBits > 0; m = m * 256 + buffer[i], i--, nBits -= 8);
  if(e === 0){
    e = 1 - eBias;
  } else if(e === eMax){
    return m ? NaN : s ? -Infinity : Infinity;
  } else {
    m = m + pow(2, mLen);
    e = e - eBias;
  } return (s ? -1 : 1) * m * pow(2, e - mLen);
};

var unpackI32 = function(bytes){
  return bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
};
var packI8 = function(it){
  return [it & 0xff];
};
var packI16 = function(it){
  return [it & 0xff, it >> 8 & 0xff];
};
var packI32 = function(it){
  return [it & 0xff, it >> 8 & 0xff, it >> 16 & 0xff, it >> 24 & 0xff];
};
var packF64 = function(it){
  return packIEEE754(it, 52, 8);
};
var packF32 = function(it){
  return packIEEE754(it, 23, 4);
};

var addGetter = function(C, key, internal){
  dP(C[PROTOTYPE], key, {get: function(){ return this[internal]; }});
};

var get = function(view, bytes, index, isLittleEndian){
  var numIndex = +index
    , intIndex = toInteger(numIndex);
  if(numIndex != intIndex || intIndex < 0 || intIndex + bytes > view[$LENGTH])throw RangeError(WRONG_INDEX);
  var store = view[$BUFFER]._b
    , start = intIndex + view[$OFFSET]
    , pack  = store.slice(start, start + bytes);
  return isLittleEndian ? pack : pack.reverse();
};
var set = function(view, bytes, index, conversion, value, isLittleEndian){
  var numIndex = +index
    , intIndex = toInteger(numIndex);
  if(numIndex != intIndex || intIndex < 0 || intIndex + bytes > view[$LENGTH])throw RangeError(WRONG_INDEX);
  var store = view[$BUFFER]._b
    , start = intIndex + view[$OFFSET]
    , pack  = conversion(+value);
  for(var i = 0; i < bytes; i++)store[start + i] = pack[isLittleEndian ? i : bytes - i - 1];
};

var validateArrayBufferArguments = function(that, length){
  anInstance(that, $ArrayBuffer, ARRAY_BUFFER);
  var numberLength = +length
    , byteLength   = toLength(numberLength);
  if(numberLength != byteLength)throw RangeError(WRONG_LENGTH);
  return byteLength;
};

if(!$typed.ABV){
  $ArrayBuffer = function ArrayBuffer(length){
    var byteLength = validateArrayBufferArguments(this, length);
    this._b       = arrayFill.call(Array(byteLength), 0);
    this[$LENGTH] = byteLength;
  };

  $DataView = function DataView(buffer, byteOffset, byteLength){
    anInstance(this, $DataView, DATA_VIEW);
    anInstance(buffer, $ArrayBuffer, DATA_VIEW);
    var bufferLength = buffer[$LENGTH]
      , offset       = toInteger(byteOffset);
    if(offset < 0 || offset > bufferLength)throw RangeError('Wrong offset!');
    byteLength = byteLength === undefined ? bufferLength - offset : toLength(byteLength);
    if(offset + byteLength > bufferLength)throw RangeError(WRONG_LENGTH);
    this[$BUFFER] = buffer;
    this[$OFFSET] = offset;
    this[$LENGTH] = byteLength;
  };

  if(DESCRIPTORS){
    addGetter($ArrayBuffer, BYTE_LENGTH, '_l');
    addGetter($DataView, BUFFER, '_b');
    addGetter($DataView, BYTE_LENGTH, '_l');
    addGetter($DataView, BYTE_OFFSET, '_o');
  }

  redefineAll($DataView[PROTOTYPE], {
    getInt8: function getInt8(byteOffset){
      return get(this, 1, byteOffset)[0] << 24 >> 24;
    },
    getUint8: function getUint8(byteOffset){
      return get(this, 1, byteOffset)[0];
    },
    getInt16: function getInt16(byteOffset /*, littleEndian */){
      var bytes = get(this, 2, byteOffset, arguments[1]);
      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
    },
    getUint16: function getUint16(byteOffset /*, littleEndian */){
      var bytes = get(this, 2, byteOffset, arguments[1]);
      return bytes[1] << 8 | bytes[0];
    },
    getInt32: function getInt32(byteOffset /*, littleEndian */){
      return unpackI32(get(this, 4, byteOffset, arguments[1]));
    },
    getUint32: function getUint32(byteOffset /*, littleEndian */){
      return unpackI32(get(this, 4, byteOffset, arguments[1])) >>> 0;
    },
    getFloat32: function getFloat32(byteOffset /*, littleEndian */){
      return unpackIEEE754(get(this, 4, byteOffset, arguments[1]), 23, 4);
    },
    getFloat64: function getFloat64(byteOffset /*, littleEndian */){
      return unpackIEEE754(get(this, 8, byteOffset, arguments[1]), 52, 8);
    },
    setInt8: function setInt8(byteOffset, value){
      set(this, 1, byteOffset, packI8, value);
    },
    setUint8: function setUint8(byteOffset, value){
      set(this, 1, byteOffset, packI8, value);
    },
    setInt16: function setInt16(byteOffset, value /*, littleEndian */){
      set(this, 2, byteOffset, packI16, value, arguments[2]);
    },
    setUint16: function setUint16(byteOffset, value /*, littleEndian */){
      set(this, 2, byteOffset, packI16, value, arguments[2]);
    },
    setInt32: function setInt32(byteOffset, value /*, littleEndian */){
      set(this, 4, byteOffset, packI32, value, arguments[2]);
    },
    setUint32: function setUint32(byteOffset, value /*, littleEndian */){
      set(this, 4, byteOffset, packI32, value, arguments[2]);
    },
    setFloat32: function setFloat32(byteOffset, value /*, littleEndian */){
      set(this, 4, byteOffset, packF32, value, arguments[2]);
    },
    setFloat64: function setFloat64(byteOffset, value /*, littleEndian */){
      set(this, 8, byteOffset, packF64, value, arguments[2]);
    }
  });
} else {
  if(!fails(function(){
    new $ArrayBuffer;     // eslint-disable-line no-new
  }) || !fails(function(){
    new $ArrayBuffer(.5); // eslint-disable-line no-new
  })){
    $ArrayBuffer = function ArrayBuffer(length){
      return new BaseBuffer(validateArrayBufferArguments(this, length));
    };
    var ArrayBufferProto = $ArrayBuffer[PROTOTYPE] = BaseBuffer[PROTOTYPE];
    for(var keys = gOPN(BaseBuffer), j = 0, key; keys.length > j; ){
      if(!((key = keys[j++]) in $ArrayBuffer))hide($ArrayBuffer, key, BaseBuffer[key]);
    };
    if(!LIBRARY)ArrayBufferProto.constructor = $ArrayBuffer;
  }
  // iOS Safari 7.x bug
  var view = new $DataView(new $ArrayBuffer(2))
    , $setInt8 = $DataView[PROTOTYPE].setInt8;
  view.setInt8(0, 2147483648);
  view.setInt8(1, 2147483649);
  if(view.getInt8(0) || !view.getInt8(1))redefineAll($DataView[PROTOTYPE], {
    setInt8: function setInt8(byteOffset, value){
      $setInt8.call(this, byteOffset, value << 24 >> 24);
    },
    setUint8: function setUint8(byteOffset, value){
      $setInt8.call(this, byteOffset, value << 24 >> 24);
    }
  }, true);
}
setToStringTag($ArrayBuffer, ARRAY_BUFFER);
setToStringTag($DataView, DATA_VIEW);
hide($DataView[PROTOTYPE], $typed.VIEW, true);
exports[ARRAY_BUFFER] = $ArrayBuffer;
exports[DATA_VIEW] = $DataView;
},{"106":106,"108":108,"113":113,"28":28,"34":34,"38":38,"40":40,"58":58,"6":6,"67":67,"72":72,"86":86,"9":9,"92":92}],113:[function(_dereq_,module,exports){
var global = _dereq_(38)
  , hide   = _dereq_(40)
  , uid    = _dereq_(114)
  , TYPED  = uid('typed_array')
  , VIEW   = uid('view')
  , ABV    = !!(global.ArrayBuffer && global.DataView)
  , CONSTR = ABV
  , i = 0, l = 9, Typed;

var TypedArrayConstructors = (
  'Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array'
).split(',');

while(i < l){
  if(Typed = global[TypedArrayConstructors[i++]]){
    hide(Typed.prototype, TYPED, true);
    hide(Typed.prototype, VIEW, true);
  } else CONSTR = false;
}

module.exports = {
  ABV:    ABV,
  CONSTR: CONSTR,
  TYPED:  TYPED,
  VIEW:   VIEW
};
},{"114":114,"38":38,"40":40}],114:[function(_dereq_,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],115:[function(_dereq_,module,exports){
var global         = _dereq_(38)
  , core           = _dereq_(23)
  , LIBRARY        = _dereq_(58)
  , wksExt         = _dereq_(116)
  , defineProperty = _dereq_(67).f;
module.exports = function(name){
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
};
},{"116":116,"23":23,"38":38,"58":58,"67":67}],116:[function(_dereq_,module,exports){
exports.f = _dereq_(117);
},{"117":117}],117:[function(_dereq_,module,exports){
var store      = _dereq_(94)('wks')
  , uid        = _dereq_(114)
  , Symbol     = _dereq_(38).Symbol
  , USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;
},{"114":114,"38":38,"94":94}],118:[function(_dereq_,module,exports){
var classof   = _dereq_(17)
  , ITERATOR  = _dereq_(117)('iterator')
  , Iterators = _dereq_(56);
module.exports = _dereq_(23).getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"117":117,"17":17,"23":23,"56":56}],119:[function(_dereq_,module,exports){
// https://github.com/benjamingr/RexExp.escape
var $export = _dereq_(32)
  , $re     = _dereq_(88)(/[\\^$*+?.()|[\]{}]/g, '\\$&');

$export($export.S, 'RegExp', {escape: function escape(it){ return $re(it); }});

},{"32":32,"88":88}],120:[function(_dereq_,module,exports){
// 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
var $export = _dereq_(32);

$export($export.P, 'Array', {copyWithin: _dereq_(8)});

_dereq_(5)('copyWithin');
},{"32":32,"5":5,"8":8}],121:[function(_dereq_,module,exports){
'use strict';
var $export = _dereq_(32)
  , $every  = _dereq_(12)(4);

$export($export.P + $export.F * !_dereq_(96)([].every, true), 'Array', {
  // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
  every: function every(callbackfn /* , thisArg */){
    return $every(this, callbackfn, arguments[1]);
  }
});
},{"12":12,"32":32,"96":96}],122:[function(_dereq_,module,exports){
// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
var $export = _dereq_(32);

$export($export.P, 'Array', {fill: _dereq_(9)});

_dereq_(5)('fill');
},{"32":32,"5":5,"9":9}],123:[function(_dereq_,module,exports){
'use strict';
var $export = _dereq_(32)
  , $filter = _dereq_(12)(2);

$export($export.P + $export.F * !_dereq_(96)([].filter, true), 'Array', {
  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
  filter: function filter(callbackfn /* , thisArg */){
    return $filter(this, callbackfn, arguments[1]);
  }
});
},{"12":12,"32":32,"96":96}],124:[function(_dereq_,module,exports){
'use strict';
// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
var $export = _dereq_(32)
  , $find   = _dereq_(12)(6)
  , KEY     = 'findIndex'
  , forced  = true;
// Shouldn't skip holes
if(KEY in [])Array(1)[KEY](function(){ forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  findIndex: function findIndex(callbackfn/*, that = undefined */){
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
_dereq_(5)(KEY);
},{"12":12,"32":32,"5":5}],125:[function(_dereq_,module,exports){
'use strict';
// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
var $export = _dereq_(32)
  , $find   = _dereq_(12)(5)
  , KEY     = 'find'
  , forced  = true;
// Shouldn't skip holes
if(KEY in [])Array(1)[KEY](function(){ forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  find: function find(callbackfn/*, that = undefined */){
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
_dereq_(5)(KEY);
},{"12":12,"32":32,"5":5}],126:[function(_dereq_,module,exports){
'use strict';
var $export  = _dereq_(32)
  , $forEach = _dereq_(12)(0)
  , STRICT   = _dereq_(96)([].forEach, true);

$export($export.P + $export.F * !STRICT, 'Array', {
  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
  forEach: function forEach(callbackfn /* , thisArg */){
    return $forEach(this, callbackfn, arguments[1]);
  }
});
},{"12":12,"32":32,"96":96}],127:[function(_dereq_,module,exports){
'use strict';
var ctx            = _dereq_(25)
  , $export        = _dereq_(32)
  , toObject       = _dereq_(109)
  , call           = _dereq_(51)
  , isArrayIter    = _dereq_(46)
  , toLength       = _dereq_(108)
  , createProperty = _dereq_(24)
  , getIterFn      = _dereq_(118);

$export($export.S + $export.F * !_dereq_(54)(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = toObject(arrayLike)
      , C       = typeof this == 'function' ? this : Array
      , aLen    = arguments.length
      , mapfn   = aLen > 1 ? arguments[1] : undefined
      , mapping = mapfn !== undefined
      , index   = 0
      , iterFn  = getIterFn(O)
      , length, result, step, iterator;
    if(mapping)mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for(result = new C(length); length > index; index++){
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

},{"108":108,"109":109,"118":118,"24":24,"25":25,"32":32,"46":46,"51":51,"54":54}],128:[function(_dereq_,module,exports){
'use strict';
var $export       = _dereq_(32)
  , $indexOf      = _dereq_(11)(false)
  , $native       = [].indexOf
  , NEGATIVE_ZERO = !!$native && 1 / [1].indexOf(1, -0) < 0;

$export($export.P + $export.F * (NEGATIVE_ZERO || !_dereq_(96)($native)), 'Array', {
  // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
  indexOf: function indexOf(searchElement /*, fromIndex = 0 */){
    return NEGATIVE_ZERO
      // convert -0 to +0
      ? $native.apply(this, arguments) || 0
      : $indexOf(this, searchElement, arguments[1]);
  }
});
},{"11":11,"32":32,"96":96}],129:[function(_dereq_,module,exports){
// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
var $export = _dereq_(32);

$export($export.S, 'Array', {isArray: _dereq_(47)});
},{"32":32,"47":47}],130:[function(_dereq_,module,exports){
'use strict';
var addToUnscopables = _dereq_(5)
  , step             = _dereq_(55)
  , Iterators        = _dereq_(56)
  , toIObject        = _dereq_(107);

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = _dereq_(53)(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');
},{"107":107,"5":5,"53":53,"55":55,"56":56}],131:[function(_dereq_,module,exports){
'use strict';
// 22.1.3.13 Array.prototype.join(separator)
var $export   = _dereq_(32)
  , toIObject = _dereq_(107)
  , arrayJoin = [].join;

// fallback for not array-like strings
$export($export.P + $export.F * (_dereq_(45) != Object || !_dereq_(96)(arrayJoin)), 'Array', {
  join: function join(separator){
    return arrayJoin.call(toIObject(this), separator === undefined ? ',' : separator);
  }
});
},{"107":107,"32":32,"45":45,"96":96}],132:[function(_dereq_,module,exports){
'use strict';
var $export       = _dereq_(32)
  , toIObject     = _dereq_(107)
  , toInteger     = _dereq_(106)
  , toLength      = _dereq_(108)
  , $native       = [].lastIndexOf
  , NEGATIVE_ZERO = !!$native && 1 / [1].lastIndexOf(1, -0) < 0;

$export($export.P + $export.F * (NEGATIVE_ZERO || !_dereq_(96)($native)), 'Array', {
  // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
  lastIndexOf: function lastIndexOf(searchElement /*, fromIndex = @[*-1] */){
    // convert -0 to +0
    if(NEGATIVE_ZERO)return $native.apply(this, arguments) || 0;
    var O      = toIObject(this)
      , length = toLength(O.length)
      , index  = length - 1;
    if(arguments.length > 1)index = Math.min(index, toInteger(arguments[1]));
    if(index < 0)index = length + index;
    for(;index >= 0; index--)if(index in O)if(O[index] === searchElement)return index || 0;
    return -1;
  }
});
},{"106":106,"107":107,"108":108,"32":32,"96":96}],133:[function(_dereq_,module,exports){
'use strict';
var $export = _dereq_(32)
  , $map    = _dereq_(12)(1);

$export($export.P + $export.F * !_dereq_(96)([].map, true), 'Array', {
  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
  map: function map(callbackfn /* , thisArg */){
    return $map(this, callbackfn, arguments[1]);
  }
});
},{"12":12,"32":32,"96":96}],134:[function(_dereq_,module,exports){
'use strict';
var $export        = _dereq_(32)
  , createProperty = _dereq_(24);

// WebKit Array.of isn't generic
$export($export.S + $export.F * _dereq_(34)(function(){
  function F(){}
  return !(Array.of.call(F) instanceof F);
}), 'Array', {
  // 22.1.2.3 Array.of( ...items)
  of: function of(/* ...args */){
    var index  = 0
      , aLen   = arguments.length
      , result = new (typeof this == 'function' ? this : Array)(aLen);
    while(aLen > index)createProperty(result, index, arguments[index++]);
    result.length = aLen;
    return result;
  }
});
},{"24":24,"32":32,"34":34}],135:[function(_dereq_,module,exports){
'use strict';
var $export = _dereq_(32)
  , $reduce = _dereq_(13);

$export($export.P + $export.F * !_dereq_(96)([].reduceRight, true), 'Array', {
  // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
  reduceRight: function reduceRight(callbackfn /* , initialValue */){
    return $reduce(this, callbackfn, arguments.length, arguments[1], true);
  }
});
},{"13":13,"32":32,"96":96}],136:[function(_dereq_,module,exports){
'use strict';
var $export = _dereq_(32)
  , $reduce = _dereq_(13);

$export($export.P + $export.F * !_dereq_(96)([].reduce, true), 'Array', {
  // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
  reduce: function reduce(callbackfn /* , initialValue */){
    return $reduce(this, callbackfn, arguments.length, arguments[1], false);
  }
});
},{"13":13,"32":32,"96":96}],137:[function(_dereq_,module,exports){
'use strict';
var $export    = _dereq_(32)
  , html       = _dereq_(41)
  , cof        = _dereq_(18)
  , toIndex    = _dereq_(105)
  , toLength   = _dereq_(108)
  , arraySlice = [].slice;

// fallback for not array-like ES3 strings and DOM objects
$export($export.P + $export.F * _dereq_(34)(function(){
  if(html)arraySlice.call(html);
}), 'Array', {
  slice: function slice(begin, end){
    var len   = toLength(this.length)
      , klass = cof(this);
    end = end === undefined ? len : end;
    if(klass == 'Array')return arraySlice.call(this, begin, end);
    var start  = toIndex(begin, len)
      , upTo   = toIndex(end, len)
      , size   = toLength(upTo - start)
      , cloned = Array(size)
      , i      = 0;
    for(; i < size; i++)cloned[i] = klass == 'String'
      ? this.charAt(start + i)
      : this[start + i];
    return cloned;
  }
});
},{"105":105,"108":108,"18":18,"32":32,"34":34,"41":41}],138:[function(_dereq_,module,exports){
'use strict';
var $export = _dereq_(32)
  , $some   = _dereq_(12)(3);

$export($export.P + $export.F * !_dereq_(96)([].some, true), 'Array', {
  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
  some: function some(callbackfn /* , thisArg */){
    return $some(this, callbackfn, arguments[1]);
  }
});
},{"12":12,"32":32,"96":96}],139:[function(_dereq_,module,exports){
'use strict';
var $export   = _dereq_(32)
  , aFunction = _dereq_(3)
  , toObject  = _dereq_(109)
  , fails     = _dereq_(34)
  , $sort     = [].sort
  , test      = [1, 2, 3];

$export($export.P + $export.F * (fails(function(){
  // IE8-
  test.sort(undefined);
}) || !fails(function(){
  // V8 bug
  test.sort(null);
  // Old WebKit
}) || !_dereq_(96)($sort)), 'Array', {
  // 22.1.3.25 Array.prototype.sort(comparefn)
  sort: function sort(comparefn){
    return comparefn === undefined
      ? $sort.call(toObject(this))
      : $sort.call(toObject(this), aFunction(comparefn));
  }
});
},{"109":109,"3":3,"32":32,"34":34,"96":96}],140:[function(_dereq_,module,exports){
_dereq_(91)('Array');
},{"91":91}],141:[function(_dereq_,module,exports){
// 20.3.3.1 / 15.9.4.4 Date.now()
var $export = _dereq_(32);

$export($export.S, 'Date', {now: function(){ return new Date().getTime(); }});
},{"32":32}],142:[function(_dereq_,module,exports){
'use strict';
// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
var $export = _dereq_(32)
  , fails   = _dereq_(34)
  , getTime = Date.prototype.getTime;

var lz = function(num){
  return num > 9 ? num : '0' + num;
};

// PhantomJS / old WebKit has a broken implementations
$export($export.P + $export.F * (fails(function(){
  return new Date(-5e13 - 1).toISOString() != '0385-07-25T07:06:39.999Z';
}) || !fails(function(){
  new Date(NaN).toISOString();
})), 'Date', {
  toISOString: function toISOString(){
    if(!isFinite(getTime.call(this)))throw RangeError('Invalid time value');
    var d = this
      , y = d.getUTCFullYear()
      , m = d.getUTCMilliseconds()
      , s = y < 0 ? '-' : y > 9999 ? '+' : '';
    return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) +
      '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) +
      'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) +
      ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
  }
});
},{"32":32,"34":34}],143:[function(_dereq_,module,exports){
'use strict';
var $export     = _dereq_(32)
  , toObject    = _dereq_(109)
  , toPrimitive = _dereq_(110);

$export($export.P + $export.F * _dereq_(34)(function(){
  return new Date(NaN).toJSON() !== null || Date.prototype.toJSON.call({toISOString: function(){ return 1; }}) !== 1;
}), 'Date', {
  toJSON: function toJSON(key){
    var O  = toObject(this)
      , pv = toPrimitive(O);
    return typeof pv == 'number' && !isFinite(pv) ? null : O.toISOString();
  }
});
},{"109":109,"110":110,"32":32,"34":34}],144:[function(_dereq_,module,exports){
var TO_PRIMITIVE = _dereq_(117)('toPrimitive')
  , proto        = Date.prototype;

if(!(TO_PRIMITIVE in proto))_dereq_(40)(proto, TO_PRIMITIVE, _dereq_(26));
},{"117":117,"26":26,"40":40}],145:[function(_dereq_,module,exports){
var DateProto    = Date.prototype
  , INVALID_DATE = 'Invalid Date'
  , TO_STRING    = 'toString'
  , $toString    = DateProto[TO_STRING]
  , getTime      = DateProto.getTime;
if(new Date(NaN) + '' != INVALID_DATE){
  _dereq_(87)(DateProto, TO_STRING, function toString(){
    var value = getTime.call(this);
    return value === value ? $toString.call(this) : INVALID_DATE;
  });
}
},{"87":87}],146:[function(_dereq_,module,exports){
// 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
var $export = _dereq_(32);

$export($export.P, 'Function', {bind: _dereq_(16)});
},{"16":16,"32":32}],147:[function(_dereq_,module,exports){
'use strict';
var isObject       = _dereq_(49)
  , getPrototypeOf = _dereq_(74)
  , HAS_INSTANCE   = _dereq_(117)('hasInstance')
  , FunctionProto  = Function.prototype;
// 19.2.3.6 Function.prototype[@@hasInstance](V)
if(!(HAS_INSTANCE in FunctionProto))_dereq_(67).f(FunctionProto, HAS_INSTANCE, {value: function(O){
  if(typeof this != 'function' || !isObject(O))return false;
  if(!isObject(this.prototype))return O instanceof this;
  // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
  while(O = getPrototypeOf(O))if(this.prototype === O)return true;
  return false;
}});
},{"117":117,"49":49,"67":67,"74":74}],148:[function(_dereq_,module,exports){
var dP         = _dereq_(67).f
  , createDesc = _dereq_(85)
  , has        = _dereq_(39)
  , FProto     = Function.prototype
  , nameRE     = /^\s*function ([^ (]*)/
  , NAME       = 'name';

var isExtensible = Object.isExtensible || function(){
  return true;
};

// 19.2.4.2 name
NAME in FProto || _dereq_(28) && dP(FProto, NAME, {
  configurable: true,
  get: function(){
    try {
      var that = this
        , name = ('' + that).match(nameRE)[1];
      has(that, NAME) || !isExtensible(that) || dP(that, NAME, createDesc(5, name));
      return name;
    } catch(e){
      return '';
    }
  }
});
},{"28":28,"39":39,"67":67,"85":85}],149:[function(_dereq_,module,exports){
'use strict';
var strong = _dereq_(19);

// 23.1 Map Objects
module.exports = _dereq_(22)('Map', function(get){
  return function Map(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key){
    var entry = strong.getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value){
    return strong.def(this, key === 0 ? 0 : key, value);
  }
}, strong, true);
},{"19":19,"22":22}],150:[function(_dereq_,module,exports){
// 20.2.2.3 Math.acosh(x)
var $export = _dereq_(32)
  , log1p   = _dereq_(60)
  , sqrt    = Math.sqrt
  , $acosh  = Math.acosh;

$export($export.S + $export.F * !($acosh
  // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
  && Math.floor($acosh(Number.MAX_VALUE)) == 710
  // Tor Browser bug: Math.acosh(Infinity) -> NaN 
  && $acosh(Infinity) == Infinity
), 'Math', {
  acosh: function acosh(x){
    return (x = +x) < 1 ? NaN : x > 94906265.62425156
      ? Math.log(x) + Math.LN2
      : log1p(x - 1 + sqrt(x - 1) * sqrt(x + 1));
  }
});
},{"32":32,"60":60}],151:[function(_dereq_,module,exports){
// 20.2.2.5 Math.asinh(x)
var $export = _dereq_(32)
  , $asinh  = Math.asinh;

function asinh(x){
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : Math.log(x + Math.sqrt(x * x + 1));
}

// Tor Browser bug: Math.asinh(0) -> -0 
$export($export.S + $export.F * !($asinh && 1 / $asinh(0) > 0), 'Math', {asinh: asinh});
},{"32":32}],152:[function(_dereq_,module,exports){
// 20.2.2.7 Math.atanh(x)
var $export = _dereq_(32)
  , $atanh  = Math.atanh;

// Tor Browser bug: Math.atanh(-0) -> 0 
$export($export.S + $export.F * !($atanh && 1 / $atanh(-0) < 0), 'Math', {
  atanh: function atanh(x){
    return (x = +x) == 0 ? x : Math.log((1 + x) / (1 - x)) / 2;
  }
});
},{"32":32}],153:[function(_dereq_,module,exports){
// 20.2.2.9 Math.cbrt(x)
var $export = _dereq_(32)
  , sign    = _dereq_(61);

$export($export.S, 'Math', {
  cbrt: function cbrt(x){
    return sign(x = +x) * Math.pow(Math.abs(x), 1 / 3);
  }
});
},{"32":32,"61":61}],154:[function(_dereq_,module,exports){
// 20.2.2.11 Math.clz32(x)
var $export = _dereq_(32);

$export($export.S, 'Math', {
  clz32: function clz32(x){
    return (x >>>= 0) ? 31 - Math.floor(Math.log(x + 0.5) * Math.LOG2E) : 32;
  }
});
},{"32":32}],155:[function(_dereq_,module,exports){
// 20.2.2.12 Math.cosh(x)
var $export = _dereq_(32)
  , exp     = Math.exp;

$export($export.S, 'Math', {
  cosh: function cosh(x){
    return (exp(x = +x) + exp(-x)) / 2;
  }
});
},{"32":32}],156:[function(_dereq_,module,exports){
// 20.2.2.14 Math.expm1(x)
var $export = _dereq_(32)
  , $expm1  = _dereq_(59);

$export($export.S + $export.F * ($expm1 != Math.expm1), 'Math', {expm1: $expm1});
},{"32":32,"59":59}],157:[function(_dereq_,module,exports){
// 20.2.2.16 Math.fround(x)
var $export   = _dereq_(32)
  , sign      = _dereq_(61)
  , pow       = Math.pow
  , EPSILON   = pow(2, -52)
  , EPSILON32 = pow(2, -23)
  , MAX32     = pow(2, 127) * (2 - EPSILON32)
  , MIN32     = pow(2, -126);

var roundTiesToEven = function(n){
  return n + 1 / EPSILON - 1 / EPSILON;
};


$export($export.S, 'Math', {
  fround: function fround(x){
    var $abs  = Math.abs(x)
      , $sign = sign(x)
      , a, result;
    if($abs < MIN32)return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
    a = (1 + EPSILON32 / EPSILON) * $abs;
    result = a - (a - $abs);
    if(result > MAX32 || result != result)return $sign * Infinity;
    return $sign * result;
  }
});
},{"32":32,"61":61}],158:[function(_dereq_,module,exports){
// 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
var $export = _dereq_(32)
  , abs     = Math.abs;

$export($export.S, 'Math', {
  hypot: function hypot(value1, value2){ // eslint-disable-line no-unused-vars
    var sum  = 0
      , i    = 0
      , aLen = arguments.length
      , larg = 0
      , arg, div;
    while(i < aLen){
      arg = abs(arguments[i++]);
      if(larg < arg){
        div  = larg / arg;
        sum  = sum * div * div + 1;
        larg = arg;
      } else if(arg > 0){
        div  = arg / larg;
        sum += div * div;
      } else sum += arg;
    }
    return larg === Infinity ? Infinity : larg * Math.sqrt(sum);
  }
});
},{"32":32}],159:[function(_dereq_,module,exports){
// 20.2.2.18 Math.imul(x, y)
var $export = _dereq_(32)
  , $imul   = Math.imul;

// some WebKit versions fails with big numbers, some has wrong arity
$export($export.S + $export.F * _dereq_(34)(function(){
  return $imul(0xffffffff, 5) != -5 || $imul.length != 2;
}), 'Math', {
  imul: function imul(x, y){
    var UINT16 = 0xffff
      , xn = +x
      , yn = +y
      , xl = UINT16 & xn
      , yl = UINT16 & yn;
    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
  }
});
},{"32":32,"34":34}],160:[function(_dereq_,module,exports){
// 20.2.2.21 Math.log10(x)
var $export = _dereq_(32);

$export($export.S, 'Math', {
  log10: function log10(x){
    return Math.log(x) / Math.LN10;
  }
});
},{"32":32}],161:[function(_dereq_,module,exports){
// 20.2.2.20 Math.log1p(x)
var $export = _dereq_(32);

$export($export.S, 'Math', {log1p: _dereq_(60)});
},{"32":32,"60":60}],162:[function(_dereq_,module,exports){
// 20.2.2.22 Math.log2(x)
var $export = _dereq_(32);

$export($export.S, 'Math', {
  log2: function log2(x){
    return Math.log(x) / Math.LN2;
  }
});
},{"32":32}],163:[function(_dereq_,module,exports){
// 20.2.2.28 Math.sign(x)
var $export = _dereq_(32);

$export($export.S, 'Math', {sign: _dereq_(61)});
},{"32":32,"61":61}],164:[function(_dereq_,module,exports){
// 20.2.2.30 Math.sinh(x)
var $export = _dereq_(32)
  , expm1   = _dereq_(59)
  , exp     = Math.exp;

// V8 near Chromium 38 has a problem with very small numbers
$export($export.S + $export.F * _dereq_(34)(function(){
  return !Math.sinh(-2e-17) != -2e-17;
}), 'Math', {
  sinh: function sinh(x){
    return Math.abs(x = +x) < 1
      ? (expm1(x) - expm1(-x)) / 2
      : (exp(x - 1) - exp(-x - 1)) * (Math.E / 2);
  }
});
},{"32":32,"34":34,"59":59}],165:[function(_dereq_,module,exports){
// 20.2.2.33 Math.tanh(x)
var $export = _dereq_(32)
  , expm1   = _dereq_(59)
  , exp     = Math.exp;

$export($export.S, 'Math', {
  tanh: function tanh(x){
    var a = expm1(x = +x)
      , b = expm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  }
});
},{"32":32,"59":59}],166:[function(_dereq_,module,exports){
// 20.2.2.34 Math.trunc(x)
var $export = _dereq_(32);

$export($export.S, 'Math', {
  trunc: function trunc(it){
    return (it > 0 ? Math.floor : Math.ceil)(it);
  }
});
},{"32":32}],167:[function(_dereq_,module,exports){
'use strict';
var global            = _dereq_(38)
  , has               = _dereq_(39)
  , cof               = _dereq_(18)
  , inheritIfRequired = _dereq_(43)
  , toPrimitive       = _dereq_(110)
  , fails             = _dereq_(34)
  , gOPN              = _dereq_(72).f
  , gOPD              = _dereq_(70).f
  , dP                = _dereq_(67).f
  , $trim             = _dereq_(102).trim
  , NUMBER            = 'Number'
  , $Number           = global[NUMBER]
  , Base              = $Number
  , proto             = $Number.prototype
  // Opera ~12 has broken Object#toString
  , BROKEN_COF        = cof(_dereq_(66)(proto)) == NUMBER
  , TRIM              = 'trim' in String.prototype;

// 7.1.3 ToNumber(argument)
var toNumber = function(argument){
  var it = toPrimitive(argument, false);
  if(typeof it == 'string' && it.length > 2){
    it = TRIM ? it.trim() : $trim(it, 3);
    var first = it.charCodeAt(0)
      , third, radix, maxCode;
    if(first === 43 || first === 45){
      third = it.charCodeAt(2);
      if(third === 88 || third === 120)return NaN; // Number('+0x1') should be NaN, old V8 fix
    } else if(first === 48){
      switch(it.charCodeAt(1)){
        case 66 : case 98  : radix = 2; maxCode = 49; break; // fast equal /^0b[01]+$/i
        case 79 : case 111 : radix = 8; maxCode = 55; break; // fast equal /^0o[0-7]+$/i
        default : return +it;
      }
      for(var digits = it.slice(2), i = 0, l = digits.length, code; i < l; i++){
        code = digits.charCodeAt(i);
        // parseInt parses a string to a first unavailable symbol
        // but ToNumber should return NaN if a string contains unavailable symbols
        if(code < 48 || code > maxCode)return NaN;
      } return parseInt(digits, radix);
    }
  } return +it;
};

if(!$Number(' 0o1') || !$Number('0b1') || $Number('+0x1')){
  $Number = function Number(value){
    var it = arguments.length < 1 ? 0 : value
      , that = this;
    return that instanceof $Number
      // check on 1..constructor(foo) case
      && (BROKEN_COF ? fails(function(){ proto.valueOf.call(that); }) : cof(that) != NUMBER)
        ? inheritIfRequired(new Base(toNumber(it)), that, $Number) : toNumber(it);
  };
  for(var keys = _dereq_(28) ? gOPN(Base) : (
    // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
    // ES6 (in case, if modules with ES6 Number statics required before):
    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
  ).split(','), j = 0, key; keys.length > j; j++){
    if(has(Base, key = keys[j]) && !has($Number, key)){
      dP($Number, key, gOPD(Base, key));
    }
  }
  $Number.prototype = proto;
  proto.constructor = $Number;
  _dereq_(87)(global, NUMBER, $Number);
}
},{"102":102,"110":110,"18":18,"28":28,"34":34,"38":38,"39":39,"43":43,"66":66,"67":67,"70":70,"72":72,"87":87}],168:[function(_dereq_,module,exports){
// 20.1.2.1 Number.EPSILON
var $export = _dereq_(32);

$export($export.S, 'Number', {EPSILON: Math.pow(2, -52)});
},{"32":32}],169:[function(_dereq_,module,exports){
// 20.1.2.2 Number.isFinite(number)
var $export   = _dereq_(32)
  , _isFinite = _dereq_(38).isFinite;

$export($export.S, 'Number', {
  isFinite: function isFinite(it){
    return typeof it == 'number' && _isFinite(it);
  }
});
},{"32":32,"38":38}],170:[function(_dereq_,module,exports){
// 20.1.2.3 Number.isInteger(number)
var $export = _dereq_(32);

$export($export.S, 'Number', {isInteger: _dereq_(48)});
},{"32":32,"48":48}],171:[function(_dereq_,module,exports){
// 20.1.2.4 Number.isNaN(number)
var $export = _dereq_(32);

$export($export.S, 'Number', {
  isNaN: function isNaN(number){
    return number != number;
  }
});
},{"32":32}],172:[function(_dereq_,module,exports){
// 20.1.2.5 Number.isSafeInteger(number)
var $export   = _dereq_(32)
  , isInteger = _dereq_(48)
  , abs       = Math.abs;

$export($export.S, 'Number', {
  isSafeInteger: function isSafeInteger(number){
    return isInteger(number) && abs(number) <= 0x1fffffffffffff;
  }
});
},{"32":32,"48":48}],173:[function(_dereq_,module,exports){
// 20.1.2.6 Number.MAX_SAFE_INTEGER
var $export = _dereq_(32);

$export($export.S, 'Number', {MAX_SAFE_INTEGER: 0x1fffffffffffff});
},{"32":32}],174:[function(_dereq_,module,exports){
// 20.1.2.10 Number.MIN_SAFE_INTEGER
var $export = _dereq_(32);

$export($export.S, 'Number', {MIN_SAFE_INTEGER: -0x1fffffffffffff});
},{"32":32}],175:[function(_dereq_,module,exports){
var $export     = _dereq_(32)
  , $parseFloat = _dereq_(81);
// 20.1.2.12 Number.parseFloat(string)
$export($export.S + $export.F * (Number.parseFloat != $parseFloat), 'Number', {parseFloat: $parseFloat});
},{"32":32,"81":81}],176:[function(_dereq_,module,exports){
var $export   = _dereq_(32)
  , $parseInt = _dereq_(82);
// 20.1.2.13 Number.parseInt(string, radix)
$export($export.S + $export.F * (Number.parseInt != $parseInt), 'Number', {parseInt: $parseInt});
},{"32":32,"82":82}],177:[function(_dereq_,module,exports){
'use strict';
var $export      = _dereq_(32)
  , toInteger    = _dereq_(106)
  , aNumberValue = _dereq_(4)
  , repeat       = _dereq_(101)
  , $toFixed     = 1..toFixed
  , floor        = Math.floor
  , data         = [0, 0, 0, 0, 0, 0]
  , ERROR        = 'Number.toFixed: incorrect invocation!'
  , ZERO         = '0';

var multiply = function(n, c){
  var i  = -1
    , c2 = c;
  while(++i < 6){
    c2 += n * data[i];
    data[i] = c2 % 1e7;
    c2 = floor(c2 / 1e7);
  }
};
var divide = function(n){
  var i = 6
    , c = 0;
  while(--i >= 0){
    c += data[i];
    data[i] = floor(c / n);
    c = (c % n) * 1e7;
  }
};
var numToString = function(){
  var i = 6
    , s = '';
  while(--i >= 0){
    if(s !== '' || i === 0 || data[i] !== 0){
      var t = String(data[i]);
      s = s === '' ? t : s + repeat.call(ZERO, 7 - t.length) + t;
    }
  } return s;
};
var pow = function(x, n, acc){
  return n === 0 ? acc : n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc);
};
var log = function(x){
  var n  = 0
    , x2 = x;
  while(x2 >= 4096){
    n += 12;
    x2 /= 4096;
  }
  while(x2 >= 2){
    n  += 1;
    x2 /= 2;
  } return n;
};

$export($export.P + $export.F * (!!$toFixed && (
  0.00008.toFixed(3) !== '0.000' ||
  0.9.toFixed(0) !== '1' ||
  1.255.toFixed(2) !== '1.25' ||
  1000000000000000128..toFixed(0) !== '1000000000000000128'
) || !_dereq_(34)(function(){
  // V8 ~ Android 4.3-
  $toFixed.call({});
})), 'Number', {
  toFixed: function toFixed(fractionDigits){
    var x = aNumberValue(this, ERROR)
      , f = toInteger(fractionDigits)
      , s = ''
      , m = ZERO
      , e, z, j, k;
    if(f < 0 || f > 20)throw RangeError(ERROR);
    if(x != x)return 'NaN';
    if(x <= -1e21 || x >= 1e21)return String(x);
    if(x < 0){
      s = '-';
      x = -x;
    }
    if(x > 1e-21){
      e = log(x * pow(2, 69, 1)) - 69;
      z = e < 0 ? x * pow(2, -e, 1) : x / pow(2, e, 1);
      z *= 0x10000000000000;
      e = 52 - e;
      if(e > 0){
        multiply(0, z);
        j = f;
        while(j >= 7){
          multiply(1e7, 0);
          j -= 7;
        }
        multiply(pow(10, j, 1), 0);
        j = e - 1;
        while(j >= 23){
          divide(1 << 23);
          j -= 23;
        }
        divide(1 << j);
        multiply(1, 1);
        divide(2);
        m = numToString();
      } else {
        multiply(0, z);
        multiply(1 << -e, 0);
        m = numToString() + repeat.call(ZERO, f);
      }
    }
    if(f > 0){
      k = m.length;
      m = s + (k <= f ? '0.' + repeat.call(ZERO, f - k) + m : m.slice(0, k - f) + '.' + m.slice(k - f));
    } else {
      m = s + m;
    } return m;
  }
});
},{"101":101,"106":106,"32":32,"34":34,"4":4}],178:[function(_dereq_,module,exports){
'use strict';
var $export      = _dereq_(32)
  , $fails       = _dereq_(34)
  , aNumberValue = _dereq_(4)
  , $toPrecision = 1..toPrecision;

$export($export.P + $export.F * ($fails(function(){
  // IE7-
  return $toPrecision.call(1, undefined) !== '1';
}) || !$fails(function(){
  // V8 ~ Android 4.3-
  $toPrecision.call({});
})), 'Number', {
  toPrecision: function toPrecision(precision){
    var that = aNumberValue(this, 'Number#toPrecision: incorrect invocation!');
    return precision === undefined ? $toPrecision.call(that) : $toPrecision.call(that, precision); 
  }
});
},{"32":32,"34":34,"4":4}],179:[function(_dereq_,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = _dereq_(32);

$export($export.S + $export.F, 'Object', {assign: _dereq_(65)});
},{"32":32,"65":65}],180:[function(_dereq_,module,exports){
var $export = _dereq_(32)
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', {create: _dereq_(66)});
},{"32":32,"66":66}],181:[function(_dereq_,module,exports){
var $export = _dereq_(32);
// 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
$export($export.S + $export.F * !_dereq_(28), 'Object', {defineProperties: _dereq_(68)});
},{"28":28,"32":32,"68":68}],182:[function(_dereq_,module,exports){
var $export = _dereq_(32);
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !_dereq_(28), 'Object', {defineProperty: _dereq_(67).f});
},{"28":28,"32":32,"67":67}],183:[function(_dereq_,module,exports){
// 19.1.2.5 Object.freeze(O)
var isObject = _dereq_(49)
  , meta     = _dereq_(62).onFreeze;

_dereq_(78)('freeze', function($freeze){
  return function freeze(it){
    return $freeze && isObject(it) ? $freeze(meta(it)) : it;
  };
});
},{"49":49,"62":62,"78":78}],184:[function(_dereq_,module,exports){
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject                 = _dereq_(107)
  , $getOwnPropertyDescriptor = _dereq_(70).f;

_dereq_(78)('getOwnPropertyDescriptor', function(){
  return function getOwnPropertyDescriptor(it, key){
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});
},{"107":107,"70":70,"78":78}],185:[function(_dereq_,module,exports){
// 19.1.2.7 Object.getOwnPropertyNames(O)
_dereq_(78)('getOwnPropertyNames', function(){
  return _dereq_(71).f;
});
},{"71":71,"78":78}],186:[function(_dereq_,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject        = _dereq_(109)
  , $getPrototypeOf = _dereq_(74);

_dereq_(78)('getPrototypeOf', function(){
  return function getPrototypeOf(it){
    return $getPrototypeOf(toObject(it));
  };
});
},{"109":109,"74":74,"78":78}],187:[function(_dereq_,module,exports){
// 19.1.2.11 Object.isExtensible(O)
var isObject = _dereq_(49);

_dereq_(78)('isExtensible', function($isExtensible){
  return function isExtensible(it){
    return isObject(it) ? $isExtensible ? $isExtensible(it) : true : false;
  };
});
},{"49":49,"78":78}],188:[function(_dereq_,module,exports){
// 19.1.2.12 Object.isFrozen(O)
var isObject = _dereq_(49);

_dereq_(78)('isFrozen', function($isFrozen){
  return function isFrozen(it){
    return isObject(it) ? $isFrozen ? $isFrozen(it) : false : true;
  };
});
},{"49":49,"78":78}],189:[function(_dereq_,module,exports){
// 19.1.2.13 Object.isSealed(O)
var isObject = _dereq_(49);

_dereq_(78)('isSealed', function($isSealed){
  return function isSealed(it){
    return isObject(it) ? $isSealed ? $isSealed(it) : false : true;
  };
});
},{"49":49,"78":78}],190:[function(_dereq_,module,exports){
// 19.1.3.10 Object.is(value1, value2)
var $export = _dereq_(32);
$export($export.S, 'Object', {is: _dereq_(89)});
},{"32":32,"89":89}],191:[function(_dereq_,module,exports){
// 19.1.2.14 Object.keys(O)
var toObject = _dereq_(109)
  , $keys    = _dereq_(76);

_dereq_(78)('keys', function(){
  return function keys(it){
    return $keys(toObject(it));
  };
});
},{"109":109,"76":76,"78":78}],192:[function(_dereq_,module,exports){
// 19.1.2.15 Object.preventExtensions(O)
var isObject = _dereq_(49)
  , meta     = _dereq_(62).onFreeze;

_dereq_(78)('preventExtensions', function($preventExtensions){
  return function preventExtensions(it){
    return $preventExtensions && isObject(it) ? $preventExtensions(meta(it)) : it;
  };
});
},{"49":49,"62":62,"78":78}],193:[function(_dereq_,module,exports){
// 19.1.2.17 Object.seal(O)
var isObject = _dereq_(49)
  , meta     = _dereq_(62).onFreeze;

_dereq_(78)('seal', function($seal){
  return function seal(it){
    return $seal && isObject(it) ? $seal(meta(it)) : it;
  };
});
},{"49":49,"62":62,"78":78}],194:[function(_dereq_,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = _dereq_(32);
$export($export.S, 'Object', {setPrototypeOf: _dereq_(90).set});
},{"32":32,"90":90}],195:[function(_dereq_,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var classof = _dereq_(17)
  , test    = {};
test[_dereq_(117)('toStringTag')] = 'z';
if(test + '' != '[object z]'){
  _dereq_(87)(Object.prototype, 'toString', function toString(){
    return '[object ' + classof(this) + ']';
  }, true);
}
},{"117":117,"17":17,"87":87}],196:[function(_dereq_,module,exports){
var $export     = _dereq_(32)
  , $parseFloat = _dereq_(81);
// 18.2.4 parseFloat(string)
$export($export.G + $export.F * (parseFloat != $parseFloat), {parseFloat: $parseFloat});
},{"32":32,"81":81}],197:[function(_dereq_,module,exports){
var $export   = _dereq_(32)
  , $parseInt = _dereq_(82);
// 18.2.5 parseInt(string, radix)
$export($export.G + $export.F * (parseInt != $parseInt), {parseInt: $parseInt});
},{"32":32,"82":82}],198:[function(_dereq_,module,exports){
'use strict';
var LIBRARY            = _dereq_(58)
  , global             = _dereq_(38)
  , ctx                = _dereq_(25)
  , classof            = _dereq_(17)
  , $export            = _dereq_(32)
  , isObject           = _dereq_(49)
  , aFunction          = _dereq_(3)
  , anInstance         = _dereq_(6)
  , forOf              = _dereq_(37)
  , speciesConstructor = _dereq_(95)
  , task               = _dereq_(104).set
  , microtask          = _dereq_(64)()
  , PROMISE            = 'Promise'
  , TypeError          = global.TypeError
  , process            = global.process
  , $Promise           = global[PROMISE]
  , process            = global.process
  , isNode             = classof(process) == 'process'
  , empty              = function(){ /* empty */ }
  , Internal, GenericPromiseCapability, Wrapper;

var USE_NATIVE = !!function(){
  try {
    // correct subclassing with @@species support
    var promise     = $Promise.resolve(1)
      , FakePromise = (promise.constructor = {})[_dereq_(117)('species')] = function(exec){ exec(empty, empty); };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
  } catch(e){ /* empty */ }
}();

// helpers
var sameConstructor = function(a, b){
  // with library wrapper special case
  return a === b || a === $Promise && b === Wrapper;
};
var isThenable = function(it){
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var newPromiseCapability = function(C){
  return sameConstructor($Promise, C)
    ? new PromiseCapability(C)
    : new GenericPromiseCapability(C);
};
var PromiseCapability = GenericPromiseCapability = function(C){
  var resolve, reject;
  this.promise = new C(function($$resolve, $$reject){
    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject  = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject  = aFunction(reject);
};
var perform = function(exec){
  try {
    exec();
  } catch(e){
    return {error: e};
  }
};
var notify = function(promise, isReject){
  if(promise._n)return;
  promise._n = true;
  var chain = promise._c;
  microtask(function(){
    var value = promise._v
      , ok    = promise._s == 1
      , i     = 0;
    var run = function(reaction){
      var handler = ok ? reaction.ok : reaction.fail
        , resolve = reaction.resolve
        , reject  = reaction.reject
        , domain  = reaction.domain
        , result, then;
      try {
        if(handler){
          if(!ok){
            if(promise._h == 2)onHandleUnhandled(promise);
            promise._h = 1;
          }
          if(handler === true)result = value;
          else {
            if(domain)domain.enter();
            result = handler(value);
            if(domain)domain.exit();
          }
          if(result === reaction.promise){
            reject(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(result)){
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch(e){
        reject(e);
      }
    };
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if(isReject && !promise._h)onUnhandled(promise);
  });
};
var onUnhandled = function(promise){
  task.call(global, function(){
    var value = promise._v
      , abrupt, handler, console;
    if(isUnhandled(promise)){
      abrupt = perform(function(){
        if(isNode){
          process.emit('unhandledRejection', value, promise);
        } else if(handler = global.onunhandledrejection){
          handler({promise: promise, reason: value});
        } else if((console = global.console) && console.error){
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if(abrupt)throw abrupt.error;
  });
};
var isUnhandled = function(promise){
  if(promise._h == 1)return false;
  var chain = promise._a || promise._c
    , i     = 0
    , reaction;
  while(chain.length > i){
    reaction = chain[i++];
    if(reaction.fail || !isUnhandled(reaction.promise))return false;
  } return true;
};
var onHandleUnhandled = function(promise){
  task.call(global, function(){
    var handler;
    if(isNode){
      process.emit('rejectionHandled', promise);
    } else if(handler = global.onrejectionhandled){
      handler({promise: promise, reason: promise._v});
    }
  });
};
var $reject = function(value){
  var promise = this;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if(!promise._a)promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function(value){
  var promise = this
    , then;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if(promise === value)throw TypeError("Promise can't be resolved itself");
    if(then = isThenable(value)){
      microtask(function(){
        var wrapper = {_w: promise, _d: false}; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch(e){
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch(e){
    $reject.call({_w: promise, _d: false}, e); // wrap
  }
};

// constructor polyfill
if(!USE_NATIVE){
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor){
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch(err){
      $reject.call(this, err);
    }
  };
  Internal = function Promise(executor){
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = _dereq_(86)($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var reaction    = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok     = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail   = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if(this._a)this._a.push(reaction);
      if(this._s)notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
  PromiseCapability = function(){
    var promise  = new Internal;
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject  = ctx($reject, promise, 1);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: $Promise});
_dereq_(92)($Promise, PROMISE);
_dereq_(91)(PROMISE);
Wrapper = _dereq_(23)[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    var capability = newPromiseCapability(this)
      , $$reject   = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
    if(x instanceof $Promise && sameConstructor(x.constructor, this))return x;
    var capability = newPromiseCapability(this)
      , $$resolve  = capability.resolve;
    $$resolve(x);
    return capability.promise;
  }
});
$export($export.S + $export.F * !(USE_NATIVE && _dereq_(54)(function(iter){
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , resolve    = capability.resolve
      , reject     = capability.reject;
    var abrupt = perform(function(){
      var values    = []
        , index     = 0
        , remaining = 1;
      forOf(iterable, false, function(promise){
        var $index        = index++
          , alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function(value){
          if(alreadyCalled)return;
          alreadyCalled  = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , reject     = capability.reject;
    var abrupt = perform(function(){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  }
});
},{"104":104,"117":117,"17":17,"23":23,"25":25,"3":3,"32":32,"37":37,"38":38,"49":49,"54":54,"58":58,"6":6,"64":64,"86":86,"91":91,"92":92,"95":95}],199:[function(_dereq_,module,exports){
// 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
var $export   = _dereq_(32)
  , aFunction = _dereq_(3)
  , anObject  = _dereq_(7)
  , rApply    = (_dereq_(38).Reflect || {}).apply
  , fApply    = Function.apply;
// MS Edge argumentsList argument is optional
$export($export.S + $export.F * !_dereq_(34)(function(){
  rApply(function(){});
}), 'Reflect', {
  apply: function apply(target, thisArgument, argumentsList){
    var T = aFunction(target)
      , L = anObject(argumentsList);
    return rApply ? rApply(T, thisArgument, L) : fApply.call(T, thisArgument, L);
  }
});
},{"3":3,"32":32,"34":34,"38":38,"7":7}],200:[function(_dereq_,module,exports){
// 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
var $export    = _dereq_(32)
  , create     = _dereq_(66)
  , aFunction  = _dereq_(3)
  , anObject   = _dereq_(7)
  , isObject   = _dereq_(49)
  , fails      = _dereq_(34)
  , bind       = _dereq_(16)
  , rConstruct = (_dereq_(38).Reflect || {}).construct;

// MS Edge supports only 2 arguments and argumentsList argument is optional
// FF Nightly sets third argument as `new.target`, but does not create `this` from it
var NEW_TARGET_BUG = fails(function(){
  function F(){}
  return !(rConstruct(function(){}, [], F) instanceof F);
});
var ARGS_BUG = !fails(function(){
  rConstruct(function(){});
});

$export($export.S + $export.F * (NEW_TARGET_BUG || ARGS_BUG), 'Reflect', {
  construct: function construct(Target, args /*, newTarget*/){
    aFunction(Target);
    anObject(args);
    var newTarget = arguments.length < 3 ? Target : aFunction(arguments[2]);
    if(ARGS_BUG && !NEW_TARGET_BUG)return rConstruct(Target, args, newTarget);
    if(Target == newTarget){
      // w/o altered newTarget, optimization for 0-4 arguments
      switch(args.length){
        case 0: return new Target;
        case 1: return new Target(args[0]);
        case 2: return new Target(args[0], args[1]);
        case 3: return new Target(args[0], args[1], args[2]);
        case 4: return new Target(args[0], args[1], args[2], args[3]);
      }
      // w/o altered newTarget, lot of arguments case
      var $args = [null];
      $args.push.apply($args, args);
      return new (bind.apply(Target, $args));
    }
    // with altered newTarget, not support built-in constructors
    var proto    = newTarget.prototype
      , instance = create(isObject(proto) ? proto : Object.prototype)
      , result   = Function.apply.call(Target, instance, args);
    return isObject(result) ? result : instance;
  }
});
},{"16":16,"3":3,"32":32,"34":34,"38":38,"49":49,"66":66,"7":7}],201:[function(_dereq_,module,exports){
// 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
var dP          = _dereq_(67)
  , $export     = _dereq_(32)
  , anObject    = _dereq_(7)
  , toPrimitive = _dereq_(110);

// MS Edge has broken Reflect.defineProperty - throwing instead of returning false
$export($export.S + $export.F * _dereq_(34)(function(){
  Reflect.defineProperty(dP.f({}, 1, {value: 1}), 1, {value: 2});
}), 'Reflect', {
  defineProperty: function defineProperty(target, propertyKey, attributes){
    anObject(target);
    propertyKey = toPrimitive(propertyKey, true);
    anObject(attributes);
    try {
      dP.f(target, propertyKey, attributes);
      return true;
    } catch(e){
      return false;
    }
  }
});
},{"110":110,"32":32,"34":34,"67":67,"7":7}],202:[function(_dereq_,module,exports){
// 26.1.4 Reflect.deleteProperty(target, propertyKey)
var $export  = _dereq_(32)
  , gOPD     = _dereq_(70).f
  , anObject = _dereq_(7);

$export($export.S, 'Reflect', {
  deleteProperty: function deleteProperty(target, propertyKey){
    var desc = gOPD(anObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  }
});
},{"32":32,"7":7,"70":70}],203:[function(_dereq_,module,exports){
'use strict';
// 26.1.5 Reflect.enumerate(target)
var $export  = _dereq_(32)
  , anObject = _dereq_(7);
var Enumerate = function(iterated){
  this._t = anObject(iterated); // target
  this._i = 0;                  // next index
  var keys = this._k = []       // keys
    , key;
  for(key in iterated)keys.push(key);
};
_dereq_(52)(Enumerate, 'Object', function(){
  var that = this
    , keys = that._k
    , key;
  do {
    if(that._i >= keys.length)return {value: undefined, done: true};
  } while(!((key = keys[that._i++]) in that._t));
  return {value: key, done: false};
});

$export($export.S, 'Reflect', {
  enumerate: function enumerate(target){
    return new Enumerate(target);
  }
});
},{"32":32,"52":52,"7":7}],204:[function(_dereq_,module,exports){
// 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
var gOPD     = _dereq_(70)
  , $export  = _dereq_(32)
  , anObject = _dereq_(7);

$export($export.S, 'Reflect', {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey){
    return gOPD.f(anObject(target), propertyKey);
  }
});
},{"32":32,"7":7,"70":70}],205:[function(_dereq_,module,exports){
// 26.1.8 Reflect.getPrototypeOf(target)
var $export  = _dereq_(32)
  , getProto = _dereq_(74)
  , anObject = _dereq_(7);

$export($export.S, 'Reflect', {
  getPrototypeOf: function getPrototypeOf(target){
    return getProto(anObject(target));
  }
});
},{"32":32,"7":7,"74":74}],206:[function(_dereq_,module,exports){
// 26.1.6 Reflect.get(target, propertyKey [, receiver])
var gOPD           = _dereq_(70)
  , getPrototypeOf = _dereq_(74)
  , has            = _dereq_(39)
  , $export        = _dereq_(32)
  , isObject       = _dereq_(49)
  , anObject       = _dereq_(7);

function get(target, propertyKey/*, receiver*/){
  var receiver = arguments.length < 3 ? target : arguments[2]
    , desc, proto;
  if(anObject(target) === receiver)return target[propertyKey];
  if(desc = gOPD.f(target, propertyKey))return has(desc, 'value')
    ? desc.value
    : desc.get !== undefined
      ? desc.get.call(receiver)
      : undefined;
  if(isObject(proto = getPrototypeOf(target)))return get(proto, propertyKey, receiver);
}

$export($export.S, 'Reflect', {get: get});
},{"32":32,"39":39,"49":49,"7":7,"70":70,"74":74}],207:[function(_dereq_,module,exports){
// 26.1.9 Reflect.has(target, propertyKey)
var $export = _dereq_(32);

$export($export.S, 'Reflect', {
  has: function has(target, propertyKey){
    return propertyKey in target;
  }
});
},{"32":32}],208:[function(_dereq_,module,exports){
// 26.1.10 Reflect.isExtensible(target)
var $export       = _dereq_(32)
  , anObject      = _dereq_(7)
  , $isExtensible = Object.isExtensible;

$export($export.S, 'Reflect', {
  isExtensible: function isExtensible(target){
    anObject(target);
    return $isExtensible ? $isExtensible(target) : true;
  }
});
},{"32":32,"7":7}],209:[function(_dereq_,module,exports){
// 26.1.11 Reflect.ownKeys(target)
var $export = _dereq_(32);

$export($export.S, 'Reflect', {ownKeys: _dereq_(80)});
},{"32":32,"80":80}],210:[function(_dereq_,module,exports){
// 26.1.12 Reflect.preventExtensions(target)
var $export            = _dereq_(32)
  , anObject           = _dereq_(7)
  , $preventExtensions = Object.preventExtensions;

$export($export.S, 'Reflect', {
  preventExtensions: function preventExtensions(target){
    anObject(target);
    try {
      if($preventExtensions)$preventExtensions(target);
      return true;
    } catch(e){
      return false;
    }
  }
});
},{"32":32,"7":7}],211:[function(_dereq_,module,exports){
// 26.1.14 Reflect.setPrototypeOf(target, proto)
var $export  = _dereq_(32)
  , setProto = _dereq_(90);

if(setProto)$export($export.S, 'Reflect', {
  setPrototypeOf: function setPrototypeOf(target, proto){
    setProto.check(target, proto);
    try {
      setProto.set(target, proto);
      return true;
    } catch(e){
      return false;
    }
  }
});
},{"32":32,"90":90}],212:[function(_dereq_,module,exports){
// 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
var dP             = _dereq_(67)
  , gOPD           = _dereq_(70)
  , getPrototypeOf = _dereq_(74)
  , has            = _dereq_(39)
  , $export        = _dereq_(32)
  , createDesc     = _dereq_(85)
  , anObject       = _dereq_(7)
  , isObject       = _dereq_(49);

function set(target, propertyKey, V/*, receiver*/){
  var receiver = arguments.length < 4 ? target : arguments[3]
    , ownDesc  = gOPD.f(anObject(target), propertyKey)
    , existingDescriptor, proto;
  if(!ownDesc){
    if(isObject(proto = getPrototypeOf(target))){
      return set(proto, propertyKey, V, receiver);
    }
    ownDesc = createDesc(0);
  }
  if(has(ownDesc, 'value')){
    if(ownDesc.writable === false || !isObject(receiver))return false;
    existingDescriptor = gOPD.f(receiver, propertyKey) || createDesc(0);
    existingDescriptor.value = V;
    dP.f(receiver, propertyKey, existingDescriptor);
    return true;
  }
  return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
}

$export($export.S, 'Reflect', {set: set});
},{"32":32,"39":39,"49":49,"67":67,"7":7,"70":70,"74":74,"85":85}],213:[function(_dereq_,module,exports){
var global            = _dereq_(38)
  , inheritIfRequired = _dereq_(43)
  , dP                = _dereq_(67).f
  , gOPN              = _dereq_(72).f
  , isRegExp          = _dereq_(50)
  , $flags            = _dereq_(36)
  , $RegExp           = global.RegExp
  , Base              = $RegExp
  , proto             = $RegExp.prototype
  , re1               = /a/g
  , re2               = /a/g
  // "new" creates a new object, old webkit buggy here
  , CORRECT_NEW       = new $RegExp(re1) !== re1;

if(_dereq_(28) && (!CORRECT_NEW || _dereq_(34)(function(){
  re2[_dereq_(117)('match')] = false;
  // RegExp constructor can alter flags and IsRegExp works correct with @@match
  return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
}))){
  $RegExp = function RegExp(p, f){
    var tiRE = this instanceof $RegExp
      , piRE = isRegExp(p)
      , fiU  = f === undefined;
    return !tiRE && piRE && p.constructor === $RegExp && fiU ? p
      : inheritIfRequired(CORRECT_NEW
        ? new Base(piRE && !fiU ? p.source : p, f)
        : Base((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? $flags.call(p) : f)
      , tiRE ? this : proto, $RegExp);
  };
  var proxy = function(key){
    key in $RegExp || dP($RegExp, key, {
      configurable: true,
      get: function(){ return Base[key]; },
      set: function(it){ Base[key] = it; }
    });
  };
  for(var keys = gOPN(Base), i = 0; keys.length > i; )proxy(keys[i++]);
  proto.constructor = $RegExp;
  $RegExp.prototype = proto;
  _dereq_(87)(global, 'RegExp', $RegExp);
}

_dereq_(91)('RegExp');
},{"117":117,"28":28,"34":34,"36":36,"38":38,"43":43,"50":50,"67":67,"72":72,"87":87,"91":91}],214:[function(_dereq_,module,exports){
// 21.2.5.3 get RegExp.prototype.flags()
if(_dereq_(28) && /./g.flags != 'g')_dereq_(67).f(RegExp.prototype, 'flags', {
  configurable: true,
  get: _dereq_(36)
});
},{"28":28,"36":36,"67":67}],215:[function(_dereq_,module,exports){
// @@match logic
_dereq_(35)('match', 1, function(defined, MATCH, $match){
  // 21.1.3.11 String.prototype.match(regexp)
  return [function match(regexp){
    'use strict';
    var O  = defined(this)
      , fn = regexp == undefined ? undefined : regexp[MATCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
  }, $match];
});
},{"35":35}],216:[function(_dereq_,module,exports){
// @@replace logic
_dereq_(35)('replace', 2, function(defined, REPLACE, $replace){
  // 21.1.3.14 String.prototype.replace(searchValue, replaceValue)
  return [function replace(searchValue, replaceValue){
    'use strict';
    var O  = defined(this)
      , fn = searchValue == undefined ? undefined : searchValue[REPLACE];
    return fn !== undefined
      ? fn.call(searchValue, O, replaceValue)
      : $replace.call(String(O), searchValue, replaceValue);
  }, $replace];
});
},{"35":35}],217:[function(_dereq_,module,exports){
// @@search logic
_dereq_(35)('search', 1, function(defined, SEARCH, $search){
  // 21.1.3.15 String.prototype.search(regexp)
  return [function search(regexp){
    'use strict';
    var O  = defined(this)
      , fn = regexp == undefined ? undefined : regexp[SEARCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
  }, $search];
});
},{"35":35}],218:[function(_dereq_,module,exports){
// @@split logic
_dereq_(35)('split', 2, function(defined, SPLIT, $split){
  'use strict';
  var isRegExp   = _dereq_(50)
    , _split     = $split
    , $push      = [].push
    , $SPLIT     = 'split'
    , LENGTH     = 'length'
    , LAST_INDEX = 'lastIndex';
  if(
    'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
    'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
    'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
    '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
    '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
    ''[$SPLIT](/.?/)[LENGTH]
  ){
    var NPCG = /()??/.exec('')[1] === undefined; // nonparticipating capturing group
    // based on es5-shim implementation, need to rework it
    $split = function(separator, limit){
      var string = String(this);
      if(separator === undefined && limit === 0)return [];
      // If `separator` is not a regex, use native split
      if(!isRegExp(separator))return _split.call(string, separator, limit);
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') +
                  (separator.multiline ? 'm' : '') +
                  (separator.unicode ? 'u' : '') +
                  (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      var splitLimit = limit === undefined ? 4294967295 : limit >>> 0;
      // Make `global` and avoid `lastIndex` issues by working with a copy
      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var separator2, match, lastIndex, lastLength, i;
      // Doesn't need flags gy, but they don't hurt
      if(!NPCG)separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);
      while(match = separatorCopy.exec(string)){
        // `separatorCopy.lastIndex` is not reliable cross-browser
        lastIndex = match.index + match[0][LENGTH];
        if(lastIndex > lastLastIndex){
          output.push(string.slice(lastLastIndex, match.index));
          // Fix browsers whose `exec` methods don't consistently return `undefined` for NPCG
          if(!NPCG && match[LENGTH] > 1)match[0].replace(separator2, function(){
            for(i = 1; i < arguments[LENGTH] - 2; i++)if(arguments[i] === undefined)match[i] = undefined;
          });
          if(match[LENGTH] > 1 && match.index < string[LENGTH])$push.apply(output, match.slice(1));
          lastLength = match[0][LENGTH];
          lastLastIndex = lastIndex;
          if(output[LENGTH] >= splitLimit)break;
        }
        if(separatorCopy[LAST_INDEX] === match.index)separatorCopy[LAST_INDEX]++; // Avoid an infinite loop
      }
      if(lastLastIndex === string[LENGTH]){
        if(lastLength || !separatorCopy.test(''))output.push('');
      } else output.push(string.slice(lastLastIndex));
      return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
    };
  // Chakra, V8
  } else if('0'[$SPLIT](undefined, 0)[LENGTH]){
    $split = function(separator, limit){
      return separator === undefined && limit === 0 ? [] : _split.call(this, separator, limit);
    };
  }
  // 21.1.3.17 String.prototype.split(separator, limit)
  return [function split(separator, limit){
    var O  = defined(this)
      , fn = separator == undefined ? undefined : separator[SPLIT];
    return fn !== undefined ? fn.call(separator, O, limit) : $split.call(String(O), separator, limit);
  }, $split];
});
},{"35":35,"50":50}],219:[function(_dereq_,module,exports){
'use strict';
_dereq_(214);
var anObject    = _dereq_(7)
  , $flags      = _dereq_(36)
  , DESCRIPTORS = _dereq_(28)
  , TO_STRING   = 'toString'
  , $toString   = /./[TO_STRING];

var define = function(fn){
  _dereq_(87)(RegExp.prototype, TO_STRING, fn, true);
};

// 21.2.5.14 RegExp.prototype.toString()
if(_dereq_(34)(function(){ return $toString.call({source: 'a', flags: 'b'}) != '/a/b'; })){
  define(function toString(){
    var R = anObject(this);
    return '/'.concat(R.source, '/',
      'flags' in R ? R.flags : !DESCRIPTORS && R instanceof RegExp ? $flags.call(R) : undefined);
  });
// FF44- RegExp#toString has a wrong name
} else if($toString.name != TO_STRING){
  define(function toString(){
    return $toString.call(this);
  });
}
},{"214":214,"28":28,"34":34,"36":36,"7":7,"87":87}],220:[function(_dereq_,module,exports){
'use strict';
var strong = _dereq_(19);

// 23.2 Set Objects
module.exports = _dereq_(22)('Set', function(get){
  return function Set(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value){
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);
},{"19":19,"22":22}],221:[function(_dereq_,module,exports){
'use strict';
// B.2.3.2 String.prototype.anchor(name)
_dereq_(99)('anchor', function(createHTML){
  return function anchor(name){
    return createHTML(this, 'a', 'name', name);
  }
});
},{"99":99}],222:[function(_dereq_,module,exports){
'use strict';
// B.2.3.3 String.prototype.big()
_dereq_(99)('big', function(createHTML){
  return function big(){
    return createHTML(this, 'big', '', '');
  }
});
},{"99":99}],223:[function(_dereq_,module,exports){
'use strict';
// B.2.3.4 String.prototype.blink()
_dereq_(99)('blink', function(createHTML){
  return function blink(){
    return createHTML(this, 'blink', '', '');
  }
});
},{"99":99}],224:[function(_dereq_,module,exports){
'use strict';
// B.2.3.5 String.prototype.bold()
_dereq_(99)('bold', function(createHTML){
  return function bold(){
    return createHTML(this, 'b', '', '');
  }
});
},{"99":99}],225:[function(_dereq_,module,exports){
'use strict';
var $export = _dereq_(32)
  , $at     = _dereq_(97)(false);
$export($export.P, 'String', {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: function codePointAt(pos){
    return $at(this, pos);
  }
});
},{"32":32,"97":97}],226:[function(_dereq_,module,exports){
// 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
'use strict';
var $export   = _dereq_(32)
  , toLength  = _dereq_(108)
  , context   = _dereq_(98)
  , ENDS_WITH = 'endsWith'
  , $endsWith = ''[ENDS_WITH];

$export($export.P + $export.F * _dereq_(33)(ENDS_WITH), 'String', {
  endsWith: function endsWith(searchString /*, endPosition = @length */){
    var that = context(this, searchString, ENDS_WITH)
      , endPosition = arguments.length > 1 ? arguments[1] : undefined
      , len    = toLength(that.length)
      , end    = endPosition === undefined ? len : Math.min(toLength(endPosition), len)
      , search = String(searchString);
    return $endsWith
      ? $endsWith.call(that, search, end)
      : that.slice(end - search.length, end) === search;
  }
});
},{"108":108,"32":32,"33":33,"98":98}],227:[function(_dereq_,module,exports){
'use strict';
// B.2.3.6 String.prototype.fixed()
_dereq_(99)('fixed', function(createHTML){
  return function fixed(){
    return createHTML(this, 'tt', '', '');
  }
});
},{"99":99}],228:[function(_dereq_,module,exports){
'use strict';
// B.2.3.7 String.prototype.fontcolor(color)
_dereq_(99)('fontcolor', function(createHTML){
  return function fontcolor(color){
    return createHTML(this, 'font', 'color', color);
  }
});
},{"99":99}],229:[function(_dereq_,module,exports){
'use strict';
// B.2.3.8 String.prototype.fontsize(size)
_dereq_(99)('fontsize', function(createHTML){
  return function fontsize(size){
    return createHTML(this, 'font', 'size', size);
  }
});
},{"99":99}],230:[function(_dereq_,module,exports){
var $export        = _dereq_(32)
  , toIndex        = _dereq_(105)
  , fromCharCode   = String.fromCharCode
  , $fromCodePoint = String.fromCodePoint;

// length should be 1, old FF problem
$export($export.S + $export.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  fromCodePoint: function fromCodePoint(x){ // eslint-disable-line no-unused-vars
    var res  = []
      , aLen = arguments.length
      , i    = 0
      , code;
    while(aLen > i){
      code = +arguments[i++];
      if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
      res.push(code < 0x10000
        ? fromCharCode(code)
        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
      );
    } return res.join('');
  }
});
},{"105":105,"32":32}],231:[function(_dereq_,module,exports){
// 21.1.3.7 String.prototype.includes(searchString, position = 0)
'use strict';
var $export  = _dereq_(32)
  , context  = _dereq_(98)
  , INCLUDES = 'includes';

$export($export.P + $export.F * _dereq_(33)(INCLUDES), 'String', {
  includes: function includes(searchString /*, position = 0 */){
    return !!~context(this, searchString, INCLUDES)
      .indexOf(searchString, arguments.length > 1 ? arguments[1] : undefined);
  }
});
},{"32":32,"33":33,"98":98}],232:[function(_dereq_,module,exports){
'use strict';
// B.2.3.9 String.prototype.italics()
_dereq_(99)('italics', function(createHTML){
  return function italics(){
    return createHTML(this, 'i', '', '');
  }
});
},{"99":99}],233:[function(_dereq_,module,exports){
'use strict';
var $at  = _dereq_(97)(true);

// 21.1.3.27 String.prototype[@@iterator]()
_dereq_(53)(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"53":53,"97":97}],234:[function(_dereq_,module,exports){
'use strict';
// B.2.3.10 String.prototype.link(url)
_dereq_(99)('link', function(createHTML){
  return function link(url){
    return createHTML(this, 'a', 'href', url);
  }
});
},{"99":99}],235:[function(_dereq_,module,exports){
var $export   = _dereq_(32)
  , toIObject = _dereq_(107)
  , toLength  = _dereq_(108);

$export($export.S, 'String', {
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  raw: function raw(callSite){
    var tpl  = toIObject(callSite.raw)
      , len  = toLength(tpl.length)
      , aLen = arguments.length
      , res  = []
      , i    = 0;
    while(len > i){
      res.push(String(tpl[i++]));
      if(i < aLen)res.push(String(arguments[i]));
    } return res.join('');
  }
});
},{"107":107,"108":108,"32":32}],236:[function(_dereq_,module,exports){
var $export = _dereq_(32);

$export($export.P, 'String', {
  // 21.1.3.13 String.prototype.repeat(count)
  repeat: _dereq_(101)
});
},{"101":101,"32":32}],237:[function(_dereq_,module,exports){
'use strict';
// B.2.3.11 String.prototype.small()
_dereq_(99)('small', function(createHTML){
  return function small(){
    return createHTML(this, 'small', '', '');
  }
});
},{"99":99}],238:[function(_dereq_,module,exports){
// 21.1.3.18 String.prototype.startsWith(searchString [, position ])
'use strict';
var $export     = _dereq_(32)
  , toLength    = _dereq_(108)
  , context     = _dereq_(98)
  , STARTS_WITH = 'startsWith'
  , $startsWith = ''[STARTS_WITH];

$export($export.P + $export.F * _dereq_(33)(STARTS_WITH), 'String', {
  startsWith: function startsWith(searchString /*, position = 0 */){
    var that   = context(this, searchString, STARTS_WITH)
      , index  = toLength(Math.min(arguments.length > 1 ? arguments[1] : undefined, that.length))
      , search = String(searchString);
    return $startsWith
      ? $startsWith.call(that, search, index)
      : that.slice(index, index + search.length) === search;
  }
});
},{"108":108,"32":32,"33":33,"98":98}],239:[function(_dereq_,module,exports){
'use strict';
// B.2.3.12 String.prototype.strike()
_dereq_(99)('strike', function(createHTML){
  return function strike(){
    return createHTML(this, 'strike', '', '');
  }
});
},{"99":99}],240:[function(_dereq_,module,exports){
'use strict';
// B.2.3.13 String.prototype.sub()
_dereq_(99)('sub', function(createHTML){
  return function sub(){
    return createHTML(this, 'sub', '', '');
  }
});
},{"99":99}],241:[function(_dereq_,module,exports){
'use strict';
// B.2.3.14 String.prototype.sup()
_dereq_(99)('sup', function(createHTML){
  return function sup(){
    return createHTML(this, 'sup', '', '');
  }
});
},{"99":99}],242:[function(_dereq_,module,exports){
'use strict';
// 21.1.3.25 String.prototype.trim()
_dereq_(102)('trim', function($trim){
  return function trim(){
    return $trim(this, 3);
  };
});
},{"102":102}],243:[function(_dereq_,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global         = _dereq_(38)
  , has            = _dereq_(39)
  , DESCRIPTORS    = _dereq_(28)
  , $export        = _dereq_(32)
  , redefine       = _dereq_(87)
  , META           = _dereq_(62).KEY
  , $fails         = _dereq_(34)
  , shared         = _dereq_(94)
  , setToStringTag = _dereq_(92)
  , uid            = _dereq_(114)
  , wks            = _dereq_(117)
  , wksExt         = _dereq_(116)
  , wksDefine      = _dereq_(115)
  , keyOf          = _dereq_(57)
  , enumKeys       = _dereq_(31)
  , isArray        = _dereq_(47)
  , anObject       = _dereq_(7)
  , toIObject      = _dereq_(107)
  , toPrimitive    = _dereq_(110)
  , createDesc     = _dereq_(85)
  , _create        = _dereq_(66)
  , gOPNExt        = _dereq_(71)
  , $GOPD          = _dereq_(70)
  , $DP            = _dereq_(67)
  , $keys          = _dereq_(76)
  , gOPD           = $GOPD.f
  , dP             = $DP.f
  , gOPN           = gOPNExt.f
  , $Symbol        = global.Symbol
  , $JSON          = global.JSON
  , _stringify     = $JSON && $JSON.stringify
  , PROTOTYPE      = 'prototype'
  , HIDDEN         = wks('_hidden')
  , TO_PRIMITIVE   = wks('toPrimitive')
  , isEnum         = {}.propertyIsEnumerable
  , SymbolRegistry = shared('symbol-registry')
  , AllSymbols     = shared('symbols')
  , OPSymbols      = shared('op-symbols')
  , ObjectProto    = Object[PROTOTYPE]
  , USE_NATIVE     = typeof $Symbol == 'function'
  , QObject        = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function(){
  return _create(dP({}, 'a', {
    get: function(){ return dP(this, 'a', {value: 7}).a; }
  })).a != 7;
}) ? function(it, key, D){
  var protoDesc = gOPD(ObjectProto, key);
  if(protoDesc)delete ObjectProto[key];
  dP(it, key, D);
  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function(tag){
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
  return typeof it == 'symbol';
} : function(it){
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D){
  if(it === ObjectProto)$defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if(has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D = _create(D, {enumerable: createDesc(0, false)});
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P){
  anObject(it);
  var keys = enumKeys(P = toIObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P){
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key){
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if(this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
  it  = toIObject(it);
  key = toPrimitive(key, true);
  if(it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return;
  var D = gOPD(it, key);
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it){
  var names  = gOPN(toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
  var IS_OP  = it === ObjectProto
    , names  = gOPN(IS_OP ? OPSymbols : toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true))result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if(!USE_NATIVE){
  $Symbol = function Symbol(){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function(value){
      if(this === ObjectProto)$set.call(OPSymbols, value);
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if(DESCRIPTORS && setter)setSymbolDesc(ObjectProto, tag, {configurable: true, set: $set});
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f   = $defineProperty;
  _dereq_(72).f = gOPNExt.f = $getOwnPropertyNames;
  _dereq_(77).f  = $propertyIsEnumerable;
  _dereq_(73).f = $getOwnPropertySymbols;

  if(DESCRIPTORS && !_dereq_(58)){
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function(name){
    return wrap(wks(name));
  }
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});

for(var symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), i = 0; symbols.length > i; )wks(symbols[i++]);

for(var symbols = $keys(wks.store), i = 0; symbols.length > i; )wksDefine(symbols[i++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    if(isSymbol(key))return keyOf(SymbolRegistry, key);
    throw TypeError(key + ' is not a symbol!');
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function(){
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it){
    if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
    var args = [it]
      , i    = 1
      , replacer, $replacer;
    while(arguments.length > i)args.push(arguments[i++]);
    replacer = args[1];
    if(typeof replacer == 'function')$replacer = replacer;
    if($replacer || !isArray(replacer))replacer = function(key, value){
      if($replacer)value = $replacer.call(this, key, value);
      if(!isSymbol(value))return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || _dereq_(40)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);
},{"107":107,"110":110,"114":114,"115":115,"116":116,"117":117,"28":28,"31":31,"32":32,"34":34,"38":38,"39":39,"40":40,"47":47,"57":57,"58":58,"62":62,"66":66,"67":67,"7":7,"70":70,"71":71,"72":72,"73":73,"76":76,"77":77,"85":85,"87":87,"92":92,"94":94}],244:[function(_dereq_,module,exports){
'use strict';
var $export      = _dereq_(32)
  , $typed       = _dereq_(113)
  , buffer       = _dereq_(112)
  , anObject     = _dereq_(7)
  , toIndex      = _dereq_(105)
  , toLength     = _dereq_(108)
  , isObject     = _dereq_(49)
  , ArrayBuffer  = _dereq_(38).ArrayBuffer
  , speciesConstructor = _dereq_(95)
  , $ArrayBuffer = buffer.ArrayBuffer
  , $DataView    = buffer.DataView
  , $isView      = $typed.ABV && ArrayBuffer.isView
  , $slice       = $ArrayBuffer.prototype.slice
  , VIEW         = $typed.VIEW
  , ARRAY_BUFFER = 'ArrayBuffer';

$export($export.G + $export.W + $export.F * (ArrayBuffer !== $ArrayBuffer), {ArrayBuffer: $ArrayBuffer});

$export($export.S + $export.F * !$typed.CONSTR, ARRAY_BUFFER, {
  // 24.1.3.1 ArrayBuffer.isView(arg)
  isView: function isView(it){
    return $isView && $isView(it) || isObject(it) && VIEW in it;
  }
});

$export($export.P + $export.U + $export.F * _dereq_(34)(function(){
  return !new $ArrayBuffer(2).slice(1, undefined).byteLength;
}), ARRAY_BUFFER, {
  // 24.1.4.3 ArrayBuffer.prototype.slice(start, end)
  slice: function slice(start, end){
    if($slice !== undefined && end === undefined)return $slice.call(anObject(this), start); // FF fix
    var len    = anObject(this).byteLength
      , first  = toIndex(start, len)
      , final  = toIndex(end === undefined ? len : end, len)
      , result = new (speciesConstructor(this, $ArrayBuffer))(toLength(final - first))
      , viewS  = new $DataView(this)
      , viewT  = new $DataView(result)
      , index  = 0;
    while(first < final){
      viewT.setUint8(index++, viewS.getUint8(first++));
    } return result;
  }
});

_dereq_(91)(ARRAY_BUFFER);
},{"105":105,"108":108,"112":112,"113":113,"32":32,"34":34,"38":38,"49":49,"7":7,"91":91,"95":95}],245:[function(_dereq_,module,exports){
var $export = _dereq_(32);
$export($export.G + $export.W + $export.F * !_dereq_(113).ABV, {
  DataView: _dereq_(112).DataView
});
},{"112":112,"113":113,"32":32}],246:[function(_dereq_,module,exports){
_dereq_(111)('Float32', 4, function(init){
  return function Float32Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"111":111}],247:[function(_dereq_,module,exports){
_dereq_(111)('Float64', 8, function(init){
  return function Float64Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"111":111}],248:[function(_dereq_,module,exports){
_dereq_(111)('Int16', 2, function(init){
  return function Int16Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"111":111}],249:[function(_dereq_,module,exports){
_dereq_(111)('Int32', 4, function(init){
  return function Int32Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"111":111}],250:[function(_dereq_,module,exports){
_dereq_(111)('Int8', 1, function(init){
  return function Int8Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"111":111}],251:[function(_dereq_,module,exports){
_dereq_(111)('Uint16', 2, function(init){
  return function Uint16Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"111":111}],252:[function(_dereq_,module,exports){
_dereq_(111)('Uint32', 4, function(init){
  return function Uint32Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"111":111}],253:[function(_dereq_,module,exports){
_dereq_(111)('Uint8', 1, function(init){
  return function Uint8Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"111":111}],254:[function(_dereq_,module,exports){
_dereq_(111)('Uint8', 1, function(init){
  return function Uint8ClampedArray(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
}, true);
},{"111":111}],255:[function(_dereq_,module,exports){
'use strict';
var each         = _dereq_(12)(0)
  , redefine     = _dereq_(87)
  , meta         = _dereq_(62)
  , assign       = _dereq_(65)
  , weak         = _dereq_(21)
  , isObject     = _dereq_(49)
  , getWeak      = meta.getWeak
  , isExtensible = Object.isExtensible
  , uncaughtFrozenStore = weak.ufstore
  , tmp          = {}
  , InternalMap;

var wrapper = function(get){
  return function WeakMap(){
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
};

var methods = {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function get(key){
    if(isObject(key)){
      var data = getWeak(key);
      if(data === true)return uncaughtFrozenStore(this).get(key);
      return data ? data[this._i] : undefined;
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function set(key, value){
    return weak.def(this, key, value);
  }
};

// 23.3 WeakMap Objects
var $WeakMap = module.exports = _dereq_(22)('WeakMap', wrapper, methods, weak, true, true);

// IE11 WeakMap frozen keys fix
if(new $WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7){
  InternalMap = weak.getConstructor(wrapper);
  assign(InternalMap.prototype, methods);
  meta.NEED = true;
  each(['delete', 'has', 'get', 'set'], function(key){
    var proto  = $WeakMap.prototype
      , method = proto[key];
    redefine(proto, key, function(a, b){
      // store frozen objects on internal weakmap shim
      if(isObject(a) && !isExtensible(a)){
        if(!this._f)this._f = new InternalMap;
        var result = this._f[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    });
  });
}
},{"12":12,"21":21,"22":22,"49":49,"62":62,"65":65,"87":87}],256:[function(_dereq_,module,exports){
'use strict';
var weak = _dereq_(21);

// 23.4 WeakSet Objects
_dereq_(22)('WeakSet', function(get){
  return function WeakSet(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.4.3.1 WeakSet.prototype.add(value)
  add: function add(value){
    return weak.def(this, value, true);
  }
}, weak, false, true);
},{"21":21,"22":22}],257:[function(_dereq_,module,exports){
'use strict';
// https://github.com/tc39/Array.prototype.includes
var $export   = _dereq_(32)
  , $includes = _dereq_(11)(true);

$export($export.P, 'Array', {
  includes: function includes(el /*, fromIndex = 0 */){
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

_dereq_(5)('includes');
},{"11":11,"32":32,"5":5}],258:[function(_dereq_,module,exports){
// https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-09/sept-25.md#510-globalasap-for-enqueuing-a-microtask
var $export   = _dereq_(32)
  , microtask = _dereq_(64)()
  , process   = _dereq_(38).process
  , isNode    = _dereq_(18)(process) == 'process';

$export($export.G, {
  asap: function asap(fn){
    var domain = isNode && process.domain;
    microtask(domain ? domain.bind(fn) : fn);
  }
});
},{"18":18,"32":32,"38":38,"64":64}],259:[function(_dereq_,module,exports){
// https://github.com/ljharb/proposal-is-error
var $export = _dereq_(32)
  , cof     = _dereq_(18);

$export($export.S, 'Error', {
  isError: function isError(it){
    return cof(it) === 'Error';
  }
});
},{"18":18,"32":32}],260:[function(_dereq_,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export  = _dereq_(32);

$export($export.P + $export.R, 'Map', {toJSON: _dereq_(20)('Map')});
},{"20":20,"32":32}],261:[function(_dereq_,module,exports){
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
var $export = _dereq_(32);

$export($export.S, 'Math', {
  iaddh: function iaddh(x0, x1, y0, y1){
    var $x0 = x0 >>> 0
      , $x1 = x1 >>> 0
      , $y0 = y0 >>> 0;
    return $x1 + (y1 >>> 0) + (($x0 & $y0 | ($x0 | $y0) & ~($x0 + $y0 >>> 0)) >>> 31) | 0;
  }
});
},{"32":32}],262:[function(_dereq_,module,exports){
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
var $export = _dereq_(32);

$export($export.S, 'Math', {
  imulh: function imulh(u, v){
    var UINT16 = 0xffff
      , $u = +u
      , $v = +v
      , u0 = $u & UINT16
      , v0 = $v & UINT16
      , u1 = $u >> 16
      , v1 = $v >> 16
      , t  = (u1 * v0 >>> 0) + (u0 * v0 >>> 16);
    return u1 * v1 + (t >> 16) + ((u0 * v1 >>> 0) + (t & UINT16) >> 16);
  }
});
},{"32":32}],263:[function(_dereq_,module,exports){
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
var $export = _dereq_(32);

$export($export.S, 'Math', {
  isubh: function isubh(x0, x1, y0, y1){
    var $x0 = x0 >>> 0
      , $x1 = x1 >>> 0
      , $y0 = y0 >>> 0;
    return $x1 - (y1 >>> 0) - ((~$x0 & $y0 | ~($x0 ^ $y0) & $x0 - $y0 >>> 0) >>> 31) | 0;
  }
});
},{"32":32}],264:[function(_dereq_,module,exports){
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
var $export = _dereq_(32);

$export($export.S, 'Math', {
  umulh: function umulh(u, v){
    var UINT16 = 0xffff
      , $u = +u
      , $v = +v
      , u0 = $u & UINT16
      , v0 = $v & UINT16
      , u1 = $u >>> 16
      , v1 = $v >>> 16
      , t  = (u1 * v0 >>> 0) + (u0 * v0 >>> 16);
    return u1 * v1 + (t >>> 16) + ((u0 * v1 >>> 0) + (t & UINT16) >>> 16);
  }
});
},{"32":32}],265:[function(_dereq_,module,exports){
'use strict';
var $export         = _dereq_(32)
  , toObject        = _dereq_(109)
  , aFunction       = _dereq_(3)
  , $defineProperty = _dereq_(67);

// B.2.2.2 Object.prototype.__defineGetter__(P, getter)
_dereq_(28) && $export($export.P + _dereq_(69), 'Object', {
  __defineGetter__: function __defineGetter__(P, getter){
    $defineProperty.f(toObject(this), P, {get: aFunction(getter), enumerable: true, configurable: true});
  }
});
},{"109":109,"28":28,"3":3,"32":32,"67":67,"69":69}],266:[function(_dereq_,module,exports){
'use strict';
var $export         = _dereq_(32)
  , toObject        = _dereq_(109)
  , aFunction       = _dereq_(3)
  , $defineProperty = _dereq_(67);

// B.2.2.3 Object.prototype.__defineSetter__(P, setter)
_dereq_(28) && $export($export.P + _dereq_(69), 'Object', {
  __defineSetter__: function __defineSetter__(P, setter){
    $defineProperty.f(toObject(this), P, {set: aFunction(setter), enumerable: true, configurable: true});
  }
});
},{"109":109,"28":28,"3":3,"32":32,"67":67,"69":69}],267:[function(_dereq_,module,exports){
// https://github.com/tc39/proposal-object-values-entries
var $export  = _dereq_(32)
  , $entries = _dereq_(79)(true);

$export($export.S, 'Object', {
  entries: function entries(it){
    return $entries(it);
  }
});
},{"32":32,"79":79}],268:[function(_dereq_,module,exports){
// https://github.com/tc39/proposal-object-getownpropertydescriptors
var $export        = _dereq_(32)
  , ownKeys        = _dereq_(80)
  , toIObject      = _dereq_(107)
  , gOPD           = _dereq_(70)
  , createProperty = _dereq_(24);

$export($export.S, 'Object', {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object){
    var O       = toIObject(object)
      , getDesc = gOPD.f
      , keys    = ownKeys(O)
      , result  = {}
      , i       = 0
      , key;
    while(keys.length > i)createProperty(result, key = keys[i++], getDesc(O, key));
    return result;
  }
});
},{"107":107,"24":24,"32":32,"70":70,"80":80}],269:[function(_dereq_,module,exports){
'use strict';
var $export                  = _dereq_(32)
  , toObject                 = _dereq_(109)
  , toPrimitive              = _dereq_(110)
  , getPrototypeOf           = _dereq_(74)
  , getOwnPropertyDescriptor = _dereq_(70).f;

// B.2.2.4 Object.prototype.__lookupGetter__(P)
_dereq_(28) && $export($export.P + _dereq_(69), 'Object', {
  __lookupGetter__: function __lookupGetter__(P){
    var O = toObject(this)
      , K = toPrimitive(P, true)
      , D;
    do {
      if(D = getOwnPropertyDescriptor(O, K))return D.get;
    } while(O = getPrototypeOf(O));
  }
});
},{"109":109,"110":110,"28":28,"32":32,"69":69,"70":70,"74":74}],270:[function(_dereq_,module,exports){
'use strict';
var $export                  = _dereq_(32)
  , toObject                 = _dereq_(109)
  , toPrimitive              = _dereq_(110)
  , getPrototypeOf           = _dereq_(74)
  , getOwnPropertyDescriptor = _dereq_(70).f;

// B.2.2.5 Object.prototype.__lookupSetter__(P)
_dereq_(28) && $export($export.P + _dereq_(69), 'Object', {
  __lookupSetter__: function __lookupSetter__(P){
    var O = toObject(this)
      , K = toPrimitive(P, true)
      , D;
    do {
      if(D = getOwnPropertyDescriptor(O, K))return D.set;
    } while(O = getPrototypeOf(O));
  }
});
},{"109":109,"110":110,"28":28,"32":32,"69":69,"70":70,"74":74}],271:[function(_dereq_,module,exports){
// https://github.com/tc39/proposal-object-values-entries
var $export = _dereq_(32)
  , $values = _dereq_(79)(false);

$export($export.S, 'Object', {
  values: function values(it){
    return $values(it);
  }
});
},{"32":32,"79":79}],272:[function(_dereq_,module,exports){
'use strict';
// https://github.com/zenparsing/es-observable
var $export     = _dereq_(32)
  , global      = _dereq_(38)
  , core        = _dereq_(23)
  , microtask   = _dereq_(64)()
  , OBSERVABLE  = _dereq_(117)('observable')
  , aFunction   = _dereq_(3)
  , anObject    = _dereq_(7)
  , anInstance  = _dereq_(6)
  , redefineAll = _dereq_(86)
  , hide        = _dereq_(40)
  , forOf       = _dereq_(37)
  , RETURN      = forOf.RETURN;

var getMethod = function(fn){
  return fn == null ? undefined : aFunction(fn);
};

var cleanupSubscription = function(subscription){
  var cleanup = subscription._c;
  if(cleanup){
    subscription._c = undefined;
    cleanup();
  }
};

var subscriptionClosed = function(subscription){
  return subscription._o === undefined;
};

var closeSubscription = function(subscription){
  if(!subscriptionClosed(subscription)){
    subscription._o = undefined;
    cleanupSubscription(subscription);
  }
};

var Subscription = function(observer, subscriber){
  anObject(observer);
  this._c = undefined;
  this._o = observer;
  observer = new SubscriptionObserver(this);
  try {
    var cleanup      = subscriber(observer)
      , subscription = cleanup;
    if(cleanup != null){
      if(typeof cleanup.unsubscribe === 'function')cleanup = function(){ subscription.unsubscribe(); };
      else aFunction(cleanup);
      this._c = cleanup;
    }
  } catch(e){
    observer.error(e);
    return;
  } if(subscriptionClosed(this))cleanupSubscription(this);
};

Subscription.prototype = redefineAll({}, {
  unsubscribe: function unsubscribe(){ closeSubscription(this); }
});

var SubscriptionObserver = function(subscription){
  this._s = subscription;
};

SubscriptionObserver.prototype = redefineAll({}, {
  next: function next(value){
    var subscription = this._s;
    if(!subscriptionClosed(subscription)){
      var observer = subscription._o;
      try {
        var m = getMethod(observer.next);
        if(m)return m.call(observer, value);
      } catch(e){
        try {
          closeSubscription(subscription);
        } finally {
          throw e;
        }
      }
    }
  },
  error: function error(value){
    var subscription = this._s;
    if(subscriptionClosed(subscription))throw value;
    var observer = subscription._o;
    subscription._o = undefined;
    try {
      var m = getMethod(observer.error);
      if(!m)throw value;
      value = m.call(observer, value);
    } catch(e){
      try {
        cleanupSubscription(subscription);
      } finally {
        throw e;
      }
    } cleanupSubscription(subscription);
    return value;
  },
  complete: function complete(value){
    var subscription = this._s;
    if(!subscriptionClosed(subscription)){
      var observer = subscription._o;
      subscription._o = undefined;
      try {
        var m = getMethod(observer.complete);
        value = m ? m.call(observer, value) : undefined;
      } catch(e){
        try {
          cleanupSubscription(subscription);
        } finally {
          throw e;
        }
      } cleanupSubscription(subscription);
      return value;
    }
  }
});

var $Observable = function Observable(subscriber){
  anInstance(this, $Observable, 'Observable', '_f')._f = aFunction(subscriber);
};

redefineAll($Observable.prototype, {
  subscribe: function subscribe(observer){
    return new Subscription(observer, this._f);
  },
  forEach: function forEach(fn){
    var that = this;
    return new (core.Promise || global.Promise)(function(resolve, reject){
      aFunction(fn);
      var subscription = that.subscribe({
        next : function(value){
          try {
            return fn(value);
          } catch(e){
            reject(e);
            subscription.unsubscribe();
          }
        },
        error: reject,
        complete: resolve
      });
    });
  }
});

redefineAll($Observable, {
  from: function from(x){
    var C = typeof this === 'function' ? this : $Observable;
    var method = getMethod(anObject(x)[OBSERVABLE]);
    if(method){
      var observable = anObject(method.call(x));
      return observable.constructor === C ? observable : new C(function(observer){
        return observable.subscribe(observer);
      });
    }
    return new C(function(observer){
      var done = false;
      microtask(function(){
        if(!done){
          try {
            if(forOf(x, false, function(it){
              observer.next(it);
              if(done)return RETURN;
            }) === RETURN)return;
          } catch(e){
            if(done)throw e;
            observer.error(e);
            return;
          } observer.complete();
        }
      });
      return function(){ done = true; };
    });
  },
  of: function of(){
    for(var i = 0, l = arguments.length, items = Array(l); i < l;)items[i] = arguments[i++];
    return new (typeof this === 'function' ? this : $Observable)(function(observer){
      var done = false;
      microtask(function(){
        if(!done){
          for(var i = 0; i < items.length; ++i){
            observer.next(items[i]);
            if(done)return;
          } observer.complete();
        }
      });
      return function(){ done = true; };
    });
  }
});

hide($Observable.prototype, OBSERVABLE, function(){ return this; });

$export($export.G, {Observable: $Observable});

_dereq_(91)('Observable');
},{"117":117,"23":23,"3":3,"32":32,"37":37,"38":38,"40":40,"6":6,"64":64,"7":7,"86":86,"91":91}],273:[function(_dereq_,module,exports){
var metadata                  = _dereq_(63)
  , anObject                  = _dereq_(7)
  , toMetaKey                 = metadata.key
  , ordinaryDefineOwnMetadata = metadata.set;

metadata.exp({defineMetadata: function defineMetadata(metadataKey, metadataValue, target, targetKey){
  ordinaryDefineOwnMetadata(metadataKey, metadataValue, anObject(target), toMetaKey(targetKey));
}});
},{"63":63,"7":7}],274:[function(_dereq_,module,exports){
var metadata               = _dereq_(63)
  , anObject               = _dereq_(7)
  , toMetaKey              = metadata.key
  , getOrCreateMetadataMap = metadata.map
  , store                  = metadata.store;

metadata.exp({deleteMetadata: function deleteMetadata(metadataKey, target /*, targetKey */){
  var targetKey   = arguments.length < 3 ? undefined : toMetaKey(arguments[2])
    , metadataMap = getOrCreateMetadataMap(anObject(target), targetKey, false);
  if(metadataMap === undefined || !metadataMap['delete'](metadataKey))return false;
  if(metadataMap.size)return true;
  var targetMetadata = store.get(target);
  targetMetadata['delete'](targetKey);
  return !!targetMetadata.size || store['delete'](target);
}});
},{"63":63,"7":7}],275:[function(_dereq_,module,exports){
var Set                     = _dereq_(220)
  , from                    = _dereq_(10)
  , metadata                = _dereq_(63)
  , anObject                = _dereq_(7)
  , getPrototypeOf          = _dereq_(74)
  , ordinaryOwnMetadataKeys = metadata.keys
  , toMetaKey               = metadata.key;

var ordinaryMetadataKeys = function(O, P){
  var oKeys  = ordinaryOwnMetadataKeys(O, P)
    , parent = getPrototypeOf(O);
  if(parent === null)return oKeys;
  var pKeys  = ordinaryMetadataKeys(parent, P);
  return pKeys.length ? oKeys.length ? from(new Set(oKeys.concat(pKeys))) : pKeys : oKeys;
};

metadata.exp({getMetadataKeys: function getMetadataKeys(target /*, targetKey */){
  return ordinaryMetadataKeys(anObject(target), arguments.length < 2 ? undefined : toMetaKey(arguments[1]));
}});
},{"10":10,"220":220,"63":63,"7":7,"74":74}],276:[function(_dereq_,module,exports){
var metadata               = _dereq_(63)
  , anObject               = _dereq_(7)
  , getPrototypeOf         = _dereq_(74)
  , ordinaryHasOwnMetadata = metadata.has
  , ordinaryGetOwnMetadata = metadata.get
  , toMetaKey              = metadata.key;

var ordinaryGetMetadata = function(MetadataKey, O, P){
  var hasOwn = ordinaryHasOwnMetadata(MetadataKey, O, P);
  if(hasOwn)return ordinaryGetOwnMetadata(MetadataKey, O, P);
  var parent = getPrototypeOf(O);
  return parent !== null ? ordinaryGetMetadata(MetadataKey, parent, P) : undefined;
};

metadata.exp({getMetadata: function getMetadata(metadataKey, target /*, targetKey */){
  return ordinaryGetMetadata(metadataKey, anObject(target), arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
}});
},{"63":63,"7":7,"74":74}],277:[function(_dereq_,module,exports){
var metadata                = _dereq_(63)
  , anObject                = _dereq_(7)
  , ordinaryOwnMetadataKeys = metadata.keys
  , toMetaKey               = metadata.key;

metadata.exp({getOwnMetadataKeys: function getOwnMetadataKeys(target /*, targetKey */){
  return ordinaryOwnMetadataKeys(anObject(target), arguments.length < 2 ? undefined : toMetaKey(arguments[1]));
}});
},{"63":63,"7":7}],278:[function(_dereq_,module,exports){
var metadata               = _dereq_(63)
  , anObject               = _dereq_(7)
  , ordinaryGetOwnMetadata = metadata.get
  , toMetaKey              = metadata.key;

metadata.exp({getOwnMetadata: function getOwnMetadata(metadataKey, target /*, targetKey */){
  return ordinaryGetOwnMetadata(metadataKey, anObject(target)
    , arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
}});
},{"63":63,"7":7}],279:[function(_dereq_,module,exports){
var metadata               = _dereq_(63)
  , anObject               = _dereq_(7)
  , getPrototypeOf         = _dereq_(74)
  , ordinaryHasOwnMetadata = metadata.has
  , toMetaKey              = metadata.key;

var ordinaryHasMetadata = function(MetadataKey, O, P){
  var hasOwn = ordinaryHasOwnMetadata(MetadataKey, O, P);
  if(hasOwn)return true;
  var parent = getPrototypeOf(O);
  return parent !== null ? ordinaryHasMetadata(MetadataKey, parent, P) : false;
};

metadata.exp({hasMetadata: function hasMetadata(metadataKey, target /*, targetKey */){
  return ordinaryHasMetadata(metadataKey, anObject(target), arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
}});
},{"63":63,"7":7,"74":74}],280:[function(_dereq_,module,exports){
var metadata               = _dereq_(63)
  , anObject               = _dereq_(7)
  , ordinaryHasOwnMetadata = metadata.has
  , toMetaKey              = metadata.key;

metadata.exp({hasOwnMetadata: function hasOwnMetadata(metadataKey, target /*, targetKey */){
  return ordinaryHasOwnMetadata(metadataKey, anObject(target)
    , arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
}});
},{"63":63,"7":7}],281:[function(_dereq_,module,exports){
var metadata                  = _dereq_(63)
  , anObject                  = _dereq_(7)
  , aFunction                 = _dereq_(3)
  , toMetaKey                 = metadata.key
  , ordinaryDefineOwnMetadata = metadata.set;

metadata.exp({metadata: function metadata(metadataKey, metadataValue){
  return function decorator(target, targetKey){
    ordinaryDefineOwnMetadata(
      metadataKey, metadataValue,
      (targetKey !== undefined ? anObject : aFunction)(target),
      toMetaKey(targetKey)
    );
  };
}});
},{"3":3,"63":63,"7":7}],282:[function(_dereq_,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export  = _dereq_(32);

$export($export.P + $export.R, 'Set', {toJSON: _dereq_(20)('Set')});
},{"20":20,"32":32}],283:[function(_dereq_,module,exports){
'use strict';
// https://github.com/mathiasbynens/String.prototype.at
var $export = _dereq_(32)
  , $at     = _dereq_(97)(true);

$export($export.P, 'String', {
  at: function at(pos){
    return $at(this, pos);
  }
});
},{"32":32,"97":97}],284:[function(_dereq_,module,exports){
'use strict';
// https://tc39.github.io/String.prototype.matchAll/
var $export     = _dereq_(32)
  , defined     = _dereq_(27)
  , toLength    = _dereq_(108)
  , isRegExp    = _dereq_(50)
  , getFlags    = _dereq_(36)
  , RegExpProto = RegExp.prototype;

var $RegExpStringIterator = function(regexp, string){
  this._r = regexp;
  this._s = string;
};

_dereq_(52)($RegExpStringIterator, 'RegExp String', function next(){
  var match = this._r.exec(this._s);
  return {value: match, done: match === null};
});

$export($export.P, 'String', {
  matchAll: function matchAll(regexp){
    defined(this);
    if(!isRegExp(regexp))throw TypeError(regexp + ' is not a regexp!');
    var S     = String(this)
      , flags = 'flags' in RegExpProto ? String(regexp.flags) : getFlags.call(regexp)
      , rx    = new RegExp(regexp.source, ~flags.indexOf('g') ? flags : 'g' + flags);
    rx.lastIndex = toLength(regexp.lastIndex);
    return new $RegExpStringIterator(rx, S);
  }
});
},{"108":108,"27":27,"32":32,"36":36,"50":50,"52":52}],285:[function(_dereq_,module,exports){
'use strict';
// https://github.com/tc39/proposal-string-pad-start-end
var $export = _dereq_(32)
  , $pad    = _dereq_(100);

$export($export.P, 'String', {
  padEnd: function padEnd(maxLength /*, fillString = ' ' */){
    return $pad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, false);
  }
});
},{"100":100,"32":32}],286:[function(_dereq_,module,exports){
'use strict';
// https://github.com/tc39/proposal-string-pad-start-end
var $export = _dereq_(32)
  , $pad    = _dereq_(100);

$export($export.P, 'String', {
  padStart: function padStart(maxLength /*, fillString = ' ' */){
    return $pad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, true);
  }
});
},{"100":100,"32":32}],287:[function(_dereq_,module,exports){
'use strict';
// https://github.com/sebmarkbage/ecmascript-string-left-right-trim
_dereq_(102)('trimLeft', function($trim){
  return function trimLeft(){
    return $trim(this, 1);
  };
}, 'trimStart');
},{"102":102}],288:[function(_dereq_,module,exports){
'use strict';
// https://github.com/sebmarkbage/ecmascript-string-left-right-trim
_dereq_(102)('trimRight', function($trim){
  return function trimRight(){
    return $trim(this, 2);
  };
}, 'trimEnd');
},{"102":102}],289:[function(_dereq_,module,exports){
_dereq_(115)('asyncIterator');
},{"115":115}],290:[function(_dereq_,module,exports){
_dereq_(115)('observable');
},{"115":115}],291:[function(_dereq_,module,exports){
// https://github.com/ljharb/proposal-global
var $export = _dereq_(32);

$export($export.S, 'System', {global: _dereq_(38)});
},{"32":32,"38":38}],292:[function(_dereq_,module,exports){
var $iterators    = _dereq_(130)
  , redefine      = _dereq_(87)
  , global        = _dereq_(38)
  , hide          = _dereq_(40)
  , Iterators     = _dereq_(56)
  , wks           = _dereq_(117)
  , ITERATOR      = wks('iterator')
  , TO_STRING_TAG = wks('toStringTag')
  , ArrayValues   = Iterators.Array;

for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
  var NAME       = collections[i]
    , Collection = global[NAME]
    , proto      = Collection && Collection.prototype
    , key;
  if(proto){
    if(!proto[ITERATOR])hide(proto, ITERATOR, ArrayValues);
    if(!proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    for(key in $iterators)if(!proto[key])redefine(proto, key, $iterators[key], true);
  }
}
},{"117":117,"130":130,"38":38,"40":40,"56":56,"87":87}],293:[function(_dereq_,module,exports){
var $export = _dereq_(32)
  , $task   = _dereq_(104);
$export($export.G + $export.B, {
  setImmediate:   $task.set,
  clearImmediate: $task.clear
});
},{"104":104,"32":32}],294:[function(_dereq_,module,exports){
// ie9- setTimeout & setInterval additional parameters fix
var global     = _dereq_(38)
  , $export    = _dereq_(32)
  , invoke     = _dereq_(44)
  , partial    = _dereq_(83)
  , navigator  = global.navigator
  , MSIE       = !!navigator && /MSIE .\./.test(navigator.userAgent); // <- dirty ie9- check
var wrap = function(set){
  return MSIE ? function(fn, time /*, ...args */){
    return set(invoke(
      partial,
      [].slice.call(arguments, 2),
      typeof fn == 'function' ? fn : Function(fn)
    ), time);
  } : set;
};
$export($export.G + $export.B + $export.F * MSIE, {
  setTimeout:  wrap(global.setTimeout),
  setInterval: wrap(global.setInterval)
});
},{"32":32,"38":38,"44":44,"83":83}],295:[function(_dereq_,module,exports){
_dereq_(243);
_dereq_(180);
_dereq_(182);
_dereq_(181);
_dereq_(184);
_dereq_(186);
_dereq_(191);
_dereq_(185);
_dereq_(183);
_dereq_(193);
_dereq_(192);
_dereq_(188);
_dereq_(189);
_dereq_(187);
_dereq_(179);
_dereq_(190);
_dereq_(194);
_dereq_(195);
_dereq_(146);
_dereq_(148);
_dereq_(147);
_dereq_(197);
_dereq_(196);
_dereq_(167);
_dereq_(177);
_dereq_(178);
_dereq_(168);
_dereq_(169);
_dereq_(170);
_dereq_(171);
_dereq_(172);
_dereq_(173);
_dereq_(174);
_dereq_(175);
_dereq_(176);
_dereq_(150);
_dereq_(151);
_dereq_(152);
_dereq_(153);
_dereq_(154);
_dereq_(155);
_dereq_(156);
_dereq_(157);
_dereq_(158);
_dereq_(159);
_dereq_(160);
_dereq_(161);
_dereq_(162);
_dereq_(163);
_dereq_(164);
_dereq_(165);
_dereq_(166);
_dereq_(230);
_dereq_(235);
_dereq_(242);
_dereq_(233);
_dereq_(225);
_dereq_(226);
_dereq_(231);
_dereq_(236);
_dereq_(238);
_dereq_(221);
_dereq_(222);
_dereq_(223);
_dereq_(224);
_dereq_(227);
_dereq_(228);
_dereq_(229);
_dereq_(232);
_dereq_(234);
_dereq_(237);
_dereq_(239);
_dereq_(240);
_dereq_(241);
_dereq_(141);
_dereq_(143);
_dereq_(142);
_dereq_(145);
_dereq_(144);
_dereq_(129);
_dereq_(127);
_dereq_(134);
_dereq_(131);
_dereq_(137);
_dereq_(139);
_dereq_(126);
_dereq_(133);
_dereq_(123);
_dereq_(138);
_dereq_(121);
_dereq_(136);
_dereq_(135);
_dereq_(128);
_dereq_(132);
_dereq_(120);
_dereq_(122);
_dereq_(125);
_dereq_(124);
_dereq_(140);
_dereq_(130);
_dereq_(213);
_dereq_(219);
_dereq_(214);
_dereq_(215);
_dereq_(216);
_dereq_(217);
_dereq_(218);
_dereq_(198);
_dereq_(149);
_dereq_(220);
_dereq_(255);
_dereq_(256);
_dereq_(244);
_dereq_(245);
_dereq_(250);
_dereq_(253);
_dereq_(254);
_dereq_(248);
_dereq_(251);
_dereq_(249);
_dereq_(252);
_dereq_(246);
_dereq_(247);
_dereq_(199);
_dereq_(200);
_dereq_(201);
_dereq_(202);
_dereq_(203);
_dereq_(206);
_dereq_(204);
_dereq_(205);
_dereq_(207);
_dereq_(208);
_dereq_(209);
_dereq_(210);
_dereq_(212);
_dereq_(211);
_dereq_(257);
_dereq_(283);
_dereq_(286);
_dereq_(285);
_dereq_(287);
_dereq_(288);
_dereq_(284);
_dereq_(289);
_dereq_(290);
_dereq_(268);
_dereq_(271);
_dereq_(267);
_dereq_(265);
_dereq_(266);
_dereq_(269);
_dereq_(270);
_dereq_(260);
_dereq_(282);
_dereq_(291);
_dereq_(259);
_dereq_(261);
_dereq_(263);
_dereq_(262);
_dereq_(264);
_dereq_(273);
_dereq_(274);
_dereq_(276);
_dereq_(275);
_dereq_(278);
_dereq_(277);
_dereq_(279);
_dereq_(280);
_dereq_(281);
_dereq_(258);
_dereq_(272);
_dereq_(294);
_dereq_(293);
_dereq_(292);
module.exports = _dereq_(23);
},{"120":120,"121":121,"122":122,"123":123,"124":124,"125":125,"126":126,"127":127,"128":128,"129":129,"130":130,"131":131,"132":132,"133":133,"134":134,"135":135,"136":136,"137":137,"138":138,"139":139,"140":140,"141":141,"142":142,"143":143,"144":144,"145":145,"146":146,"147":147,"148":148,"149":149,"150":150,"151":151,"152":152,"153":153,"154":154,"155":155,"156":156,"157":157,"158":158,"159":159,"160":160,"161":161,"162":162,"163":163,"164":164,"165":165,"166":166,"167":167,"168":168,"169":169,"170":170,"171":171,"172":172,"173":173,"174":174,"175":175,"176":176,"177":177,"178":178,"179":179,"180":180,"181":181,"182":182,"183":183,"184":184,"185":185,"186":186,"187":187,"188":188,"189":189,"190":190,"191":191,"192":192,"193":193,"194":194,"195":195,"196":196,"197":197,"198":198,"199":199,"200":200,"201":201,"202":202,"203":203,"204":204,"205":205,"206":206,"207":207,"208":208,"209":209,"210":210,"211":211,"212":212,"213":213,"214":214,"215":215,"216":216,"217":217,"218":218,"219":219,"220":220,"221":221,"222":222,"223":223,"224":224,"225":225,"226":226,"227":227,"228":228,"229":229,"23":23,"230":230,"231":231,"232":232,"233":233,"234":234,"235":235,"236":236,"237":237,"238":238,"239":239,"240":240,"241":241,"242":242,"243":243,"244":244,"245":245,"246":246,"247":247,"248":248,"249":249,"250":250,"251":251,"252":252,"253":253,"254":254,"255":255,"256":256,"257":257,"258":258,"259":259,"260":260,"261":261,"262":262,"263":263,"264":264,"265":265,"266":266,"267":267,"268":268,"269":269,"270":270,"271":271,"272":272,"273":273,"274":274,"275":275,"276":276,"277":277,"278":278,"279":279,"280":280,"281":281,"282":282,"283":283,"284":284,"285":285,"286":286,"287":287,"288":288,"289":289,"290":290,"291":291,"292":292,"293":293,"294":294}],296:[function(_dereq_,module,exports){
(function (global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `value instanceof AwaitArgument` to determine if the yielded value is
  // meant to be awaited. Some may consider the name of this method too
  // cutesy, but they are curmudgeons.
  runtime.awrap = function(arg) {
    return new AwaitArgument(arg);
  };

  function AwaitArgument(arg) {
    this.arg = arg;
  }

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value instanceof AwaitArgument) {
          return Promise.resolve(value.arg).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    if (typeof process === "object" && process.domain) {
      invoke = process.domain.bind(invoke);
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          if (method === "return" ||
              (method === "throw" && delegate.iterator[method] === undefined)) {
            // A return or throw (when the delegate iterator has no throw
            // method) always terminates the yield* loop.
            context.delegate = null;

            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            var returnMethod = delegate.iterator["return"];
            if (returnMethod) {
              var record = tryCatch(returnMethod, delegate.iterator, arg);
              if (record.type === "throw") {
                // If the return method threw an exception, let that
                // exception prevail over the original return or throw.
                method = "throw";
                arg = record.arg;
                continue;
              }
            }

            if (method === "return") {
              // Continue with the outer return, now that the delegate
              // iterator has been terminated.
              continue;
            }
          }

          var record = tryCatch(
            delegate.iterator[method],
            delegate.iterator,
            arg
          );

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;
            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = arg;

        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }

        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(arg) call above.
          method = "throw";
          arg = record.arg;
        }
      }
    };
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp[toStringTagSymbol] = "Generator";

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global :
  typeof window === "object" ? window :
  typeof self === "object" ? self : this
);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);

"use strict";

(function () {
    'use strict';

    var sGis = {};

    sGis.version = "0.2.2";
    sGis.releaseDate = "21.12.2016";

    var loadedModules = { 'sGis': sGis };
    var loadingDefs = [];

    sGis.module = function (moduleName, dependencies, intiHandler) {
        if (loadedModules[moduleName]) throw new Error('Module definition conflict: ' + moduleName);
        loadingDefs.push(Array.prototype.slice.call(arguments));

        while (loadModules()) {}
    };

    sGis.module.onLoad = null;

    function loadModules() {
        var loaded = 0;
        var list = loadingDefs.slice();
        var remains = [];
        list.forEach(function (def, index) {
            var deps = [];
            for (var i = 0; i < def[1].length; i++) {
                if (!loadedModules[def[1][i]]) {
                    remains.push(def);

                    return;
                }
                deps.push(loadedModules[def[1][i]]);
            }

            if (loadedModules[def[0]]) debugger;
            var module = def[2].apply(this, deps);
            loadedModules[def[0]] = module;
            setModuleReference(module, def[0]);
            loaded++;

            if (sGis.module.onLoad) sGis.module.onLoad(def[0]);
        });
        loadingDefs = remains;

        sGis.loadingDefs = loadingDefs;

        return loaded;
    }

    sGis.loadedModules = loadedModules;

    window.sGis = sGis;

    function setModuleReference(module, name) {
        var ns = name.split('.');
        var curr = sGis;
        for (var i = 0; i < ns.length - 1; i++) {
            if (!curr[ns[i]]) curr[ns[i]] = {};
            curr = curr[ns[i]];
        }
        curr[ns.pop()] = module;
    }
})();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

sGis.module('Bbox', ['utils', 'CRS', 'Point'], function (utils, CRS, Point) {
    'use strict';

    var defaults = {
        _crs: CRS.geo
    };

    var Bbox = function () {
        function Bbox(point1, point2, crs) {
            _classCallCheck(this, Bbox);

            if (crs) this._crs = crs;
            this._p = [Math.min(point1[0], point2[0]), Math.min(point1[1], point2[1]), Math.max(point1[0], point2[0]), Math.max(point1[1], point2[1])];
        }

        _createClass(Bbox, [{
            key: 'projectTo',
            value: function projectTo(crs) {
                var projected1 = new Point(this._p.slice(0, 2), this._crs).projectTo(crs).position;
                var projected2 = new Point(this._p.slice(2, 4), this._crs).projectTo(crs).position;
                return new Bbox(projected1, projected2, crs);
            }
        }, {
            key: 'clone',
            value: function clone() {
                return this.projectTo(this._crs);
            }
        }, {
            key: 'equals',
            value: function equals(bbox) {
                var target = bbox.coordinates;
                for (var i = 0; i < 4; i++) {
                    if (!utils.softEquals(this._p[i], target[i])) return false;
                }return this._crs.equals(bbox.crs);
            }
        }, {
            key: 'intersects',
            value: function intersects(bbox) {
                var projected = bbox.projectTo(this._crs);
                return this.xMax > projected.xMin && this.xMin < projected.xMax && this.yMax > projected.yMin && this.yMin < projected.yMax;
            }
        }, {
            key: 'contains',
            value: function contains(point) {
                var projected = point.projectTo(this.crs);
                return this.xMin <= projected.x && this.xMax >= projected.x && this.yMin <= projected.y && this.yMax >= projected.y;
            }
        }, {
            key: 'center',
            get: function get() {
                return new Point([(this.xMax + this.xMin) / 2, (this.yMax + this.yMin) / 2], this.crs);
            }
        }, {
            key: 'crs',
            get: function get() {
                return this._crs;
            }
        }, {
            key: 'xMax',
            get: function get() {
                return this._p[2];
            },
            set: function set(value) {
                if (value < this.xMin) utils.error('Max value cannot be lower than the min value');
                this._p[2] = value;
            }
        }, {
            key: 'yMax',
            get: function get() {
                return this._p[3];
            },
            set: function set(value) {
                if (value < this.yMin) utils.error('Max value cannot be lower than the min value');
                this._p[3] = value;
            }
        }, {
            key: 'xMin',
            get: function get() {
                return this._p[0];
            },
            set: function set(value) {
                if (value > this.xMax) utils.error('Min value cannot be higher than the max value');
                this._p[0] = value;
            }
        }, {
            key: 'yMin',
            get: function get() {
                return this._p[1];
            },
            set: function set(value) {
                if (value > this.yMax) utils.error('Min value cannot be higher than the max value');
                this._p[1] = value;
            }
        }, {
            key: 'width',
            get: function get() {
                return this.xMax - this.xMin;
            }
        }, {
            key: 'height',
            get: function get() {
                return this.yMax - this.yMin;
            }
        }, {
            key: 'coordinates',
            get: function get() {
                return utils.copyArray(this._p);
            }
        }]);

        return Bbox;
    }();

    utils.extend(Bbox.prototype, defaults);

    return Bbox;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

sGis.module('Crs', [], function () {
    'use strict';

    var identityProjection = function identityProjection(_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            x = _ref2[0],
            y = _ref2[1];

        return [x, y];
    };

    var Crs = function () {
        function Crs(description, projectionsMap) {
            _classCallCheck(this, Crs);

            this.description = description;
            this._projections = projectionsMap || new Map();
        }

        _createClass(Crs, [{
            key: 'equals',
            value: function equals(crs) {
                if (this === crs || this.description === crs.description) return true;

                if (this.description instanceof Object && crs.description instanceof Object) {
                    return JSON.stringify(this.description) === JSON.stringify(crs.description);
                }

                return false;
            }
        }, {
            key: 'projectionTo',
            value: function projectionTo(crs) {
                if (this._projections.get(crs)) return this._projections.get(crs);
                return this._discoverProjectionTo(crs);
            }
        }, {
            key: 'canProjectTo',
            value: function canProjectTo(crs) {
                return this.projectionTo(crs) !== null;
            }
        }, {
            key: 'setProjectionTo',
            value: function setProjectionTo(crs, func) {
                this._projections.set(crs, func);
            }
        }, {
            key: '_discoverProjectionTo',
            value: function _discoverProjectionTo(crs) {
                var _this = this;

                if (this._discoveryMode) return null;
                if (this.equals(crs)) return identityProjection;

                this._discoveryMode = true;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    var _loop = function _loop() {
                        var _step$value = _slicedToArray(_step.value, 2),
                            ownCrs = _step$value[0],
                            func = _step$value[1];

                        if (ownCrs.equals(crs)) {
                            _this._projections.set(crs, func);
                            return 'break';
                        }

                        var innerProjection = ownCrs._discoverProjectionTo(crs);
                        if (innerProjection) {
                            var result = function result(_ref3) {
                                var _ref4 = _slicedToArray(_ref3, 2),
                                    x = _ref4[0],
                                    y = _ref4[1];

                                return innerProjection(func([x, y]));
                            };
                            _this._projections.set(crs, result);
                            return 'break';
                        }
                    };

                    for (var _iterator = this._projections[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var _ret = _loop();

                        if (_ret === 'break') break;
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                this._discoveryMode = false;

                return this._projections.get(crs) || null;
            }
        }, {
            key: 'getWkidString',
            value: function getWkidString() {
                return this.description;
            }
        }, {
            key: 'stringDescription',
            get: function get() {
                return JSON.stringify(this.description);
            }
        }]);

        return Crs;
    }();

    return Crs;
});

sGis.module('CRS', ['Crs', 'math'], function (Crs, math) {
    var CRS = {};

    CRS.plain = new Crs('Plain crs without any projection functions');

    CRS.wgs84 = new Crs({ wkid: 4326 });

    CRS.geo = new Crs('Native geographical coordinate system. It is same as wgs84, but x is longitude, rather then latitude.');
    CRS.geo.setProjectionTo(CRS.wgs84, function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
            x = _ref6[0],
            y = _ref6[1];

        return [y, x];
    });

    CRS.geo.from = function (x, y) {
        return { x: x, y: y };
    };

    CRS.geo.to = function (x, y) {
        return { x: x, y: y };
    };

    CRS.wgs84.setProjectionTo(CRS.geo, function (_ref7) {
        var _ref8 = _slicedToArray(_ref7, 2),
            x = _ref8[0],
            y = _ref8[1];

        return [y, x];
    });

    {
        (function () {
            var a = 6378137;

            CRS.webMercator = new Crs({ wkid: 102113 });
            CRS.webMercator.setProjectionTo(CRS.wgs84, function (_ref9) {
                var _ref10 = _slicedToArray(_ref9, 2),
                    x = _ref10[0],
                    y = _ref10[1];

                var rLat = Math.PI / 2 - 2 * Math.atan(Math.exp(-y / a));
                var rLong = x / a;
                var lon = math.radToDeg(rLong);
                var lat = math.radToDeg(rLat);

                return [lon, lat];
            });
            CRS.wgs84.setProjectionTo(CRS.webMercator, function (_ref11) {
                var _ref12 = _slicedToArray(_ref11, 2),
                    x = _ref12[0],
                    y = _ref12[1];

                var rLon = math.degToRad(x);
                var rLat = math.degToRad(y);
                var X = a * rLon;
                var Y = a * Math.log(Math.tan(Math.PI / 4 + rLat / 2));

                return [X, Y];
            });

            CRS.webMercator.from = function (x, y) {
                var _CRS$webMercator$proj = CRS.webMercator.projectionTo(CRS.geo)([x, y]),
                    _CRS$webMercator$proj2 = _slicedToArray(_CRS$webMercator$proj, 2),
                    lat = _CRS$webMercator$proj2[0],
                    lon = _CRS$webMercator$proj2[1];

                return { x: lon, y: lat, lon: lon, lat: lat };
            };

            CRS.webMercator.to = function (lon, lat) {
                var _CRS$geo$projectionTo = CRS.geo.projectionTo(CRS.webMercator)([lat, lon]),
                    _CRS$geo$projectionTo2 = _slicedToArray(_CRS$geo$projectionTo, 2),
                    x = _CRS$geo$projectionTo2[0],
                    y = _CRS$geo$projectionTo2[1];

                return { x: x, y: y };
            };
        })();
    }

    {
        (function () {
            var a = 6378137;
            var b = 6356752.3142;
            var e = Math.sqrt(1 - b * b / a / a);
            var eh = e / 2;
            var pih = Math.PI / 2;

            CRS.ellipticalMercator = new Crs({ wkid: 667 });
            CRS.ellipticalMercator.setProjectionTo(CRS.wgs84, function (_ref13) {
                var _ref14 = _slicedToArray(_ref13, 2),
                    x = _ref14[0],
                    y = _ref14[1];

                var ts = Math.exp(-y / a);
                var phi = pih - 2 * Math.atan(ts);
                var i = 0;
                var dphi = 1;

                while (Math.abs(dphi) > 0.000000001 && i++ < 15) {
                    var con = e * Math.sin(phi);
                    dphi = pih - 2 * Math.atan(ts * Math.pow((1 - con) / (1 + con), eh)) - phi;
                    phi += dphi;
                }

                var rLong = x / a,
                    rLat = phi,
                    lon = math.radToDeg(rLong),
                    lat = math.radToDeg(rLat);

                return [lon, lat];
            });
            CRS.wgs84.setProjectionTo(CRS.ellipticalMercator, function (_ref15) {
                var _ref16 = _slicedToArray(_ref15, 2),
                    x = _ref16[0],
                    y = _ref16[1];

                var rLat = math.degToRad(y);
                var rLon = math.degToRad(x);
                var X = a * rLon;
                var Y = a * Math.log(Math.tan(Math.PI / 4 + rLat / 2) * Math.pow((1 - e * Math.sin(rLat)) / (1 + e * Math.sin(rLat)), e / 2));

                return [X, Y];
            });

            CRS.ellipticalMercator.from = function (x, y) {
                var _CRS$ellipticalMercat = CRS.ellipticalMercator.projectionTo(CRS.geo)([x, y]),
                    _CRS$ellipticalMercat2 = _slicedToArray(_CRS$ellipticalMercat, 2),
                    lat = _CRS$ellipticalMercat2[0],
                    lon = _CRS$ellipticalMercat2[1];

                return { x: lon, y: lat, lon: lon, lat: lat };
            };

            CRS.ellipticalMercator.to = function (lat, lon) {
                var _CRS$geo$projectionTo3 = CRS.geo.projectionTo(CRS.ellipticalMercator)([lat, lon]),
                    _CRS$geo$projectionTo4 = _slicedToArray(_CRS$geo$projectionTo3, 2),
                    x = _CRS$geo$projectionTo4[0],
                    y = _CRS$geo$projectionTo4[1];

                return { x: x, y: y };
            };
        })();
    }

    CRS.moscowBessel = new Crs({ "wkt": "PROJCS[\"Moscow_bessel\",GEOGCS[\"GCS_Bessel_1841\",DATUM[\"D_Bessel_1841\",SPHEROID[\"Bessel_1841\",6377397.155,299.1528128]],PRIMEM[\"Greenwich\",0.0],UNIT[\"Degree\",0.0174532925199433]],PROJECTION[\"Transverse_Mercator\"],PARAMETER[\"False_Easting\",0.0],PARAMETER[\"False_Northing\",0.0],PARAMETER[\"Central_Meridian\",37.5],PARAMETER[\"Scale_Factor\",1.0],PARAMETER[\"Latitude_Of_Origin\",55.66666666666666],UNIT[\"Meter\",1.0]]" });

    {
        (function () {

            var R = 6372795;

            var AlbersEqualArea = function (_Crs) {
                _inherits(AlbersEqualArea, _Crs);

                function AlbersEqualArea(lat0, lon0, stLat1, stLat2) {
                    _classCallCheck(this, AlbersEqualArea);

                    var _this2 = _possibleConstructorReturn(this, (AlbersEqualArea.__proto__ || Object.getPrototypeOf(AlbersEqualArea)).call(this, 'Albers Equal-Area Conic Projection: ' + lat0 + ',' + lon0 + ',' + stLat1 + ',' + stLat2));

                    var _lat0 = math.degToRad(lat0);
                    var _lon0 = math.degToRad(lon0);
                    var _stLat1 = math.degToRad(stLat1);
                    var _stLat2 = math.degToRad(stLat2);
                    var _n = (Math.sin(_stLat1) + Math.sin(_stLat2)) / 2;
                    var _c = Math.pow(Math.cos(_stLat1), 2) + 2 * _n * Math.sin(_stLat1);
                    var _ro0 = Math.sqrt(_c - 2 * _n * Math.sin(_lat0)) / _n;

                    _this2.setProjectionTo(CRS.wgs84, function (_ref17) {
                        var _ref18 = _slicedToArray(_ref17, 2),
                            x = _ref18[0],
                            y = _ref18[1];

                        var xRad = x / R;
                        var yRad = y / R;
                        var th = Math.atan(xRad / (_ro0 - yRad));
                        var ro = xRad / Math.sin(th);
                        var rLat = Math.asin((_c - ro * ro * _n * _n) / 2 / _n);
                        var rLon = _lon0 + th / _n;

                        var lat = math.radToDeg(rLat);
                        var lon = math.radToDeg(rLon);

                        return [lon, lat];
                    });

                    CRS.wgs84.setProjectionTo(_this2, function (_ref19) {
                        var _ref20 = _slicedToArray(_ref19, 2),
                            lon = _ref20[0],
                            lat = _ref20[1];

                        var rLon = math.degToRad(lon),
                            rLat = math.degToRad(lat),
                            th = _n * (rLat - _lon0),
                            ro = Math.sqrt(_c - 2 * _n * Math.sin(rLon)) / _n,
                            x = ro * Math.sin(th) * R,
                            y = _ro0 - ro * Math.cos(th) * R;

                        return [x, y];
                    });
                    return _this2;
                }

                return AlbersEqualArea;
            }(Crs);

            AlbersEqualArea.prototype.from = function (x, y) {
                var _projectionTo = this.projectionTo(CRS.geo)([x, y]),
                    _projectionTo2 = _slicedToArray(_projectionTo, 2),
                    lat = _projectionTo2[0],
                    lon = _projectionTo2[1];

                return { x: lon, y: lat, lon: lon, lat: lat };
            };
            AlbersEqualArea.prototype.to = function (lat, lon) {
                var _CRS$geo$projectionTo5 = CRS.geo.projectionTo(this)([lat, lon]),
                    _CRS$geo$projectionTo6 = _slicedToArray(_CRS$geo$projectionTo5, 2),
                    x = _CRS$geo$projectionTo6[0],
                    y = _CRS$geo$projectionTo6[1];

                return { x: x, y: y };
            };

            CRS.AlbersEqualArea = AlbersEqualArea;
        })();
    }

    CRS.cylindricalEqualArea = new CRS.AlbersEqualArea(0, 180, 60, 50);

    return CRS;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('DynamicLayer', ['utils', 'Layer', 'feature.Image', 'symbol.image.Image'], function (utils, Layer, Image, ImageSymbol) {
    'use strict';

    var DynamicLayer = function (_Layer) {
        _inherits(DynamicLayer, _Layer);

        function DynamicLayer(getUrlDelegate, properties) {
            _classCallCheck(this, DynamicLayer);

            var _this = _possibleConstructorReturn(this, (DynamicLayer.__proto__ || Object.getPrototypeOf(DynamicLayer)).call(this, properties));

            _this._getUrl = getUrlDelegate;
            return _this;
        }

        _createClass(DynamicLayer, [{
            key: 'getFeatures',
            value: function getFeatures(bbox, resolution) {
                if (!this.checkVisibility(resolution)) return [];

                if (this.crs) {
                    if (bbox.crs.canProjectTo(this.crs)) {
                        bbox = bbox.projectTo(this.crs);
                    } else {
                        return [];
                    }
                }

                if (this._features && this._features[0].crs !== bbox.crs) this._features = null;

                if (!this._features) this._createFeature(bbox);
                var width = bbox.width / resolution;
                var height = bbox.height / resolution;
                if (this._forceUpdate || !this._features[0].bbox.equals(bbox) || this._features[0].width !== width || this._features[0].height !== height) {
                    var url = this._getUrl(bbox, resolution);
                    if (url == null) return [];
                    if (this._forceUpdate) {
                        url += '&ts=' + Date.now();
                        this._forceUpdate = false;
                    }

                    this._features[0].src = url;
                    this._features[0].bbox = bbox;
                    this._features[0].width = bbox.width / resolution;
                    this._features[0].height = bbox.height / resolution;
                }

                return this._features;
            }
        }, {
            key: 'forceUpdate',
            value: function forceUpdate() {
                this._forceUpdate = true;
                this.fire('propertyChange', { property: 'source' });
            }
        }, {
            key: '_createFeature',
            value: function _createFeature(bbox) {
                var feature = new Image(bbox, { crs: this.crs || bbox.crs, opacity: this.opacity });
                this._features = [feature];
                this._updateSymbol();
            }
        }, {
            key: '_updateSymbol',
            value: function _updateSymbol() {
                if (this._features) this._features[0].symbol = new ImageSymbol({ opacity: this.opacity });
            }
        }, {
            key: 'opacity',
            get: function get() {
                return this.getOpacity();
            },
            set: function set(opacity) {
                this.setOpacity(opacity);
                this._updateSymbol();
            }
        }, {
            key: 'crs',
            get: function get() {
                return this._crs;
            },
            set: function set(crs) {
                this._crs = crs;
            }
        }, {
            key: 'url',
            get: function get() {
                return this._url;
            }
        }]);

        return DynamicLayer;
    }(Layer);

    DynamicLayer.prototype.additionalParameters = {};

    DynamicLayer.prototype.delayedUpdate = true;

    DynamicLayer.prototype._crs = null;

    return DynamicLayer;
});
'use strict';

sGis.module('event', [], function () {

    'use strict';

    var id = 0;

    var ev = {
        add: function add(element, type, handler) {
            if (type === 'wheel') type = getWheelEventType();
            if (!handler.guid) handler.guid = ++id;

            if (!element.events) {
                element.events = {};
                element.handle = function (event) {
                    return commonHandle.call(element, event);
                };
            }

            if (!element.events[type]) {
                element.events[type] = {};

                if (element.addEventListener) {
                    element.addEventListener(type, element.handle, false);
                } else if (element.attachEvent) {
                    element.attachEvent("on" + type, element.handle);
                }
            }

            element.events[type][handler.guid] = handler;

            return handler;
        },

        remove: function remove(element, type, handler) {
            var handlers = element.events && element.events[type];
            if (!handlers) return;

            if (!handler) {
                Object.keys(handlers).forEach(function (key) {
                    delete handlers[key];
                });
            } else {
                delete handlers[handler.guid];
            }

            if (Object.keys(handlers).length > 0) return;

            if (element.removeEventListener) {
                element.removeEventListener(type, element.handle, false);
            } else if (element.detachEvent) {
                element.detachEvent("on" + type, element.handle);
            }

            delete element.events[type];

            if (Object.keys(element.events).length > 0) return;

            try {
                delete element.handle;
                delete element.events;
            } catch (e) {
                element.removeAttribute("handle");
                element.removeAttribute("events");
            }
        }
    };

    function fixEvent(event) {
        event = event || window.event;

        if (event.isFixed) {
            return event;
        }
        event.isFixed = true;

        event.preventDefault = event.preventDefault || function () {
            this.returnValue = false;
        };
        event.stopPropagation = event.stopPropagation || function () {
            this.cancelBubble = true;
        };

        if (!event.target) {
            event.target = event.srcElement;
        }

        if (!event.currentTarget) {
            event.currentTarget = event.srcElement;
        }

        if (event.relatedTarget === undefined && event.fromElement) {
            event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
        }

        if (event.pageX == null && event.clientX != null) {
            var html = document.documentElement,
                body = document.body;
            event.pageX = event.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
            event.pageY = event.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
        }

        if (!event.which && event.button) {
            event.which = event.button & 1 ? 1 : event.button & 2 ? 3 : event.button & 4 ? 2 : 0;
        }

        return event;
    }

    function commonHandle(event) {
        event = fixEvent(event);

        var handlers = this.events[event.type];
        var keys = Object.keys(handlers);
        for (var i = 0; i < keys.length; i++) {
            var ret = handlers[keys[i]].call(this, event);
            if (ret === false) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
        }
    }

    function getWheelEventType() {
        if (document.addEventListener) {
            if ('onwheel' in document) {
                return 'wheel';
            } else if ('onmousewheel' in document) {
                return 'mousewheel';
            } else {
                return 'MozMousePixelScroll';
            }
        }
    }

    ev.getWheelDirection = function (e) {
        var wheelData = (e.detail ? e.detail * -1 : e.wheelDelta / 40) || e.deltaY * -1;
        if (wheelData > 0) {
            wheelData = 1;
        } else if (wheelData < 0) {
            wheelData = -1;
        }
        return wheelData;
    };

    ev.getMouseOffset = function (target, e) {
        var docPos = ev.getPosition(target);
        return { x: e.pageX - docPos.x, y: e.pageY - docPos.y };
    };

    ev.getPosition = function (e) {
        var clientRect = e.getBoundingClientRect(),
            x = window.pageXOffset !== undefined ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft,
            y = window.pageYOffset !== undefined ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
        return { x: clientRect.left + x, y: clientRect.top + y };
    };

    return ev;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

sGis.module('EventHandler', ['utils'], function (utils) {
    'use strict';

    var EventHandler = function () {
        function EventHandler() {
            _classCallCheck(this, EventHandler);
        }

        _createClass(EventHandler, [{
            key: 'forwardEvent',
            value: function forwardEvent(sGisEvent) {
                if (this._prohibitedEvents && this._prohibitedEvents.indexOf(sGisEvent.eventType) !== -1) return;
                var eventType = sGisEvent.eventType;
                if (this._eventHandlers && this._eventHandlers[eventType]) {
                    var handlerList = utils.copyArray(this._eventHandlers[eventType]);
                    for (var i = 0, len = handlerList.length; i < len; i++) {
                        if (handlerList[i].oneTime) {
                            var currentIndex = this._eventHandlers[eventType].indexOf(handlerList[i]);
                            this._eventHandlers[eventType].splice(currentIndex, 1);
                        }
                        handlerList[i].handler.call(this, sGisEvent);
                        if (sGisEvent._cancelPropagation) break;
                    }
                }
            }
        }, {
            key: 'fire',
            value: function fire(eventType, parameters) {
                if (this._prohibitedEvents && this._prohibitedEvents.indexOf(eventType) !== -1) return null;

                var sGisEvent = {};
                if (parameters) utils.extend(sGisEvent, parameters);

                var types = getTypes(eventType);
                if (types.length !== 1) utils.error('Exactly on type of event can be fired at a time, but ' + types.length + ' is given');

                sGisEvent.sourceObject = this;
                sGisEvent.eventType = types[0];
                sGisEvent.stopPropagation = function () {
                    sGisEvent._cancelPropagation = true;
                };
                sGisEvent.preventDefault = function () {
                    sGisEvent._cancelDefault = true;
                };
                sGisEvent.isCanceled = function () {
                    return sGisEvent._cancelPropagation === true;
                };

                this.forwardEvent(sGisEvent);

                return sGisEvent;
            }
        }, {
            key: 'addListener',
            value: function addListener(description, handler) {
                if (!(handler instanceof Function)) utils.error('Function is expected but got ' + handler + ' instead');
                if (!utils.isString(description)) utils.error('String is expected but got ' + description + ' instead');

                var types = getTypes(description);
                if (types.length < 1) utils.error('No event type is specified');

                var namespaces = getNamespaces(description);
                if (!this._eventHandlers) this._setHandlerList();

                for (var i = 0; i < types.length; i++) {
                    if (!this._eventHandlers[types[i]]) this._eventHandlers[types[i]] = [];
                    this._eventHandlers[types[i]].push({ handler: handler, namespaces: namespaces });
                }
            }
        }, {
            key: 'once',
            value: function once(description, handler) {
                if (!(handler instanceof Function)) utils.error('Function is expected but got ' + handler + ' instead');
                if (!utils.isString(description)) utils.error('String is expected but got ' + description + ' instead');

                var types = getTypes(description);
                if (types.length !== 1) utils.error('Only one event type can be specified with .once() method');
                var namespaces = getNamespaces(description);
                if (!this._eventHandlers) this._setHandlerList();

                if (!this._eventHandlers) this._setHandlerList();
                if (!this._eventHandlers[types[0]]) this._eventHandlers[types[0]] = [];
                this._eventHandlers[types[0]].push({ handler: handler, namespaces: namespaces, oneTime: true });
            }
        }, {
            key: 'removeListener',
            value: function removeListener(description, handler) {
                if (!utils.isString(description)) utils.error('Expected the name of the event and handler function, but got (' + description + ', ' + handler + ') instead');

                var types = getTypes(description);
                var namespaces = getNamespaces(description);

                if (namespaces.length === 0) {
                    if (types.length === 0) utils.error('At least one event type or namespace must be specified');
                    if (!handler) utils.error('To remove all listeners of the given type use the .removeAllListeners() method');
                }

                if (!this._eventHandlers) return;
                if (types.length === 0) types = Object.keys(this._eventHandlers);

                for (var i = 0; i < types.length; i++) {
                    if (this._eventHandlers[types[i]]) {
                        for (var j = this._eventHandlers[types[i]].length - 1; j >= 0; j--) {
                            if ((namespaces === null || namespaces.length === 0 || utils.arrayIntersect(this._eventHandlers[types[i]][j].namespaces, namespaces)) && (!handler || this._eventHandlers[types[i]][j].handler === handler)) {
                                this._eventHandlers[types[i]].splice(j, 1);
                            }
                        }
                    }
                }
            }
        }, {
            key: 'prohibitEvent',
            value: function prohibitEvent(type) {
                if (!this._prohibitedEvents) this._prohibitedEvents = [];
                this._prohibitedEvents.push(type);
            }
        }, {
            key: 'allowEvent',
            value: function allowEvent(type) {
                if (!this._prohibitedEvents) return;
                var index = this._prohibitedEvents.indexOf(type);
                if (index !== -1) this._prohibitedEvents.splice(index, 1);
            }
        }, {
            key: 'hasListener',
            value: function hasListener(type, handler) {
                if (!utils.isString(type) || !utils.isFunction(handler)) utils.error('Expected the name of the event and handler function, but got (' + type + ', ' + handler + ') instead');

                if (this._eventHandlers && this._eventHandlers[type]) {
                    for (var i = 0; i < this._eventHandlers[type].length; i++) {
                        if (this._eventHandlers[type][i].handler === handler) return true;
                    }
                }

                return false;
            }
        }, {
            key: 'hasListeners',
            value: function hasListeners(description) {
                if (!utils.isString(description)) utils.error('Expected the name of the event, but got ' + description + ' instead');
                if (!this._eventHandlers) return false;

                var types = getTypes(description);
                var namespaces = getNamespaces(description);

                if (types.length === 0) types = Object.keys(this._eventHandlers);

                for (var i = 0; i < types.length; i++) {
                    if (this._eventHandlers[types[i]] && this._eventHandlers[types[i]].length > 0) {
                        if (namespaces.length > 0) {
                            for (var j = 0; j < this._eventHandlers[types[i]].length; j++) {
                                if (utils.arrayIntersect(this._eventHandlers[types[i]][j].namespaces, namespaces)) {
                                    return true;
                                }
                            }
                        } else {
                            return true;
                        }
                    }
                }
                return false;
            }
        }, {
            key: 'getHandlers',
            value: function getHandlers(type) {
                if (!utils.isString(type)) utils.error('Expected the name of the e*vent, but got ' + type + ' instead');
                if (this._eventHandlers && this._eventHandlers[type]) {
                    return utils.copyObject(this._eventHandlers[type]);
                }
                return [];
            }
        }, {
            key: 'removeAllListeners',
            value: function removeAllListeners() {
                delete this._eventHandlers;
            }
        }, {
            key: '_setHandlerList',
            value: function _setHandlerList() {
                Object.defineProperty(this, '_eventHandlers', { value: {}, configurable: true });
            }
        }, {
            key: 'on',
            value: function on() {
                this.addListener.apply(this, arguments);
            }
        }, {
            key: 'off',
            value: function off() {
                this.removeListener.apply(this, arguments);
            }
        }]);

        return EventHandler;
    }();

    function getTypes(string) {
        return string.replace(/\.[A-Za-z0-9_-]+/g, '').match(/[A-Za-z0-9_-]+/g) || [];
    }

    function getNamespaces(string) {
        return string.match(/\.[A-Za-z0-9_-]+/g) || [];
    }

    return EventHandler;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('FeatureLayer', ['utils', 'Layer'], function (utils, Layer) {
    'use strict';

    var FeatureLayer = function (_Layer) {
        _inherits(FeatureLayer, _Layer);

        function FeatureLayer() {
            var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            _classCallCheck(this, FeatureLayer);

            if (properties.features) {
                var features = properties.features;
                delete properties.features;
            }

            var _this = _possibleConstructorReturn(this, (FeatureLayer.__proto__ || Object.getPrototypeOf(FeatureLayer)).call(this, properties));

            _this._features = features || [];
            return _this;
        }

        _createClass(FeatureLayer, [{
            key: 'getFeatures',
            value: function getFeatures(bbox, resolution) {
                if (!this.checkVisibility(resolution)) return [];

                var obj = [];
                this._features.forEach(function (feature) {
                    if (feature.crs.canProjectTo(bbox.crs) && feature.bbox.intersects(bbox)) obj.push(feature);
                });

                return obj;
            }
        }, {
            key: 'add',
            value: function add(features) {
                var _this2 = this;

                if (Array.isArray(features)) {
                    features.forEach(function (feature) {
                        _this2.add(feature);
                    });
                } else {
                    this._features.push(features);
                    this.fire('featureAdd', { feature: features });
                    this.redraw();
                }
            }
        }, {
            key: 'remove',
            value: function remove(feature) {
                var index = this._features.indexOf(feature);
                if (index === -1) utils.error('The feature does not belong to the layer');
                this._features.splice(index, 1);
                this.fire('featureRemove', { feature: feature });
                this.redraw();
            }
        }, {
            key: 'has',
            value: function has(feature) {
                return this._features.indexOf(feature) !== -1;
            }
        }, {
            key: 'moveToTop',
            value: function moveToTop(feature) {
                var index = this._features.indexOf(feature);
                if (index !== -1) {
                    this._features.splice(index, 1);
                    this._features.push(feature);
                    this.redraw();
                }
            }
        }, {
            key: 'features',
            get: function get() {
                return this._features.slice();
            },
            set: function set(features) {
                this.prohibitEvent('propertyChange');
                var currFeatures = this.features;
                for (var i = 0; i < currFeatures.length; i++) {
                    this.remove(currFeatures[i]);
                }

                this.add(features);
                this.allowEvent('propertyChange');

                this.redraw();
            }
        }]);

        return FeatureLayer;
    }(Layer);

    FeatureLayer.prototype.delayedUpdate = true;

    return FeatureLayer;
});
'use strict';

sGis.module('geotools', ['math', 'utils', 'CRS', 'Point'], function (math, utils, CRS, Point) {
    'use strict';

    var geotools = {};

    geotools.distance = function (a, b) {
        var l = void 0;
        if (a.crs.canProjectTo(CRS.wgs84)) {
            var p1 = a.projectTo(CRS.wgs84);
            var p2 = b.projectTo(CRS.wgs84);
            var lat1 = math.degToRad(p1.y);
            var lat2 = math.degToRad(p2.y);
            var dLat = lat2 - lat1;
            var dLon = math.degToRad(p2.x - p1.x);

            var d = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(d), Math.sqrt(1 - d));
            var R = 6371009;

            l = R * c;
        } else {
            l = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
        }

        return l;
    };

    geotools.length = function (rings, crs) {
        var enclose = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        var length = 0;
        var ringTemp = void 0;

        for (var ring = 0, l = rings.length; ring < l; ring++) {
            ringTemp = [].concat(rings[ring]);
            if (enclose) ringTemp.push(ringTemp[0]);

            for (var i = 0, m = ringTemp.length - 1; i < m; i++) {
                length += geotools.distance(new Point(ringTemp[i], crs), new Point(ringTemp[i + 1], crs));
            }
        }

        return length;
    };

    geotools.area = function (rings, crs) {
        var projected = void 0;
        if (crs.canProjectTo(CRS.cylindricalEqualArea)) {
            projected = geotools.projectRings(rings, crs, CRS.cylindricalEqualArea);
        } else {
            projected = rings;
        }

        var area = 0;
        projected.forEach(function (ring) {
            return area += polygonArea(ring);
        });
        return area;
    };

    geotools.projectRings = function (rings, fromCrs, toCrs) {
        var projection = fromCrs.projectionTo(toCrs);
        var result = [];
        rings.forEach(function (ring) {
            var projectedRing = [];
            ring.forEach(function (position) {
                projectedRing.push(projection(position));
            });
            result.push(projectedRing);
        });
        return result;
    };

    function polygonArea(coord) {
        coord = coord.concat([coord[0]]);

        var area = 0;
        for (var i = 0, l = coord.length - 1; i < l; i++) {
            area += (coord[i][0] + coord[i + 1][0]) * (coord[i][1] - coord[i + 1][1]);
        }
        return Math.abs(area / 2);
    }

    geotools.pointToLineProjection = function (point, line) {
        if (line[0][0] === line[1][0]) {
            return [line[0][0], point[1]];
        } else if (line[0][1] === line[1][1]) {
            return [point[0], line[0][1]];
        } else {
            var lx = line[1][0] - line[0][0];
            var ly = line[1][1] - line[0][1];
            var dx = line[0][0] - point[0];
            var dy = line[0][1] - point[1];
            var t = -(dx * lx + dy * ly) / (lx * lx + ly * ly);
            var x = line[0][0] + t * lx;
            var y = line[0][1] + t * ly;
            return [x, y];
        }
    };

    geotools.contains = function (polygon, point, tolerance) {
        tolerance = tolerance || 0;
        var intersectionCount = 0;

        var polygonCoord = polygon[0][0][0] === undefined ? [polygon] : polygon;
        for (var ring = 0, l = polygonCoord.length; ring < l; ring++) {
            var points = polygonCoord[ring].concat([polygonCoord[ring][0]]);
            var prevD = points[0][0] > point[0];
            var prevH = points[0][1] > point[1];

            for (var i = 1; i < points.length; i++) {
                if (geotools.pointToLineDistance(point, [points[i - 1], points[i]]) <= tolerance) {
                    return [ring, i - 1];
                }

                var D = points[i][0] > point[0];
                var H = points[i][1] > point[1];

                if (H !== prevH && (D > 0 || prevD > 0)) {
                    if (!(point[1] === points[i][1] && point[1] === points[i - 1][1])) {
                        if (geotools.intersects([[points[i][0], points[i][1]], [points[i - 1][0], points[i - 1][1]]], [point, [Math.max(points[i][0], points[i - 1][0]), point[1]]])) {
                            intersectionCount++;
                        }
                    }
                }
                prevD = D;
                prevH = H;
            }
        }
        return intersectionCount % 2 === 1;
    };

    geotools.pointToLineDistance = function (point, line) {
        var lx = line[1][0] - line[0][0];
        var ly = line[1][1] - line[0][1];
        var dx = line[0][0] - point[0];
        var dy = line[0][1] - point[1];
        var t = 0 - (dx * lx + dy * ly) / (lx * lx + ly * ly);

        t = t < 0 ? 0 : t > 1 ? 1 : t;
        return Math.sqrt(Math.pow(lx * t + dx, 2) + Math.pow(ly * t + dy, 2));
    };

    geotools.intersects = function (line1, line2) {
        if (line1[0][0] === line1[1][0]) {
            return line1[0][0] > line2[0][0];
        } else {
            var k = (line1[0][1] - line1[1][1]) / (line1[0][0] - line1[1][0]);
            var b = line1[0][1] - k * line1[0][0];
            var x = (line2[0][1] - b) / k;

            return x > line2[0][0];
        }
    };

    geotools.getLineAngle = function (line) {
        if (line[0][0] === line[1][0] && line[0][1] === line[1][1]) return NaN;
        var x = line[1][0] - line[0][0];
        var y = line[1][1] - line[0][1];
        var cos = x / Math.sqrt(x * x + y * y);
        return y >= 0 ? Math.acos(cos) : -Math.acos(cos);
    };

    geotools.getPointFromAngleAndDistance = function (point, angle, distance) {
        return [point[0] + Math.cos(angle) * distance, point[1] + Math.sin(angle) * distance];
    };

    geotools.isPolygonValid = function (polygon) {
        var coordinates = polygon.rings ? polygon.rings : polygon;
        if (coordinates.length === 0) return false;

        for (var ring = 0; ring < coordinates.length; ring++) {
            if (coordinates[ring].length <= 2) return false;

            for (var i = 0; i < coordinates[ring].length; i++) {
                var p1 = coordinates[ring][i];
                var p2 = coordinates[ring][i + 1] || coordinates[ring][0];

                if (p1[0] == p2[0] && p1[1] === p2[1]) return false;

                if (hasIntersection(coordinates, [p1, p2], [ring, i])) return false;
            }
        }

        return true;
    };

    function hasIntersection(coordinates, line, exc) {
        for (var ring = 0; ring < coordinates.length; ring++) {
            for (var i = 0; i < coordinates[ring].length; i++) {
                if (ring === exc[0] && (Math.abs(i - exc[1]) < 2 || exc[1] === 0 && i === coordinates[ring].length - 1 || i === 0 && exc[1] === coordinates[ring].length - 1)) continue;

                if (intersects([coordinates[ring][i], coordinates[ring][i + 1] || coordinates[ring][0]], line)) return true;
            }
        }
        return false;
    }

    function intersects(l1, l2) {
        var o1 = orient(l1[0], l1[1], l2[0]);
        var o2 = orient(l1[0], l1[1], l2[1]);
        var o3 = orient(l2[0], l2[1], l1[0]);
        var o4 = orient(l2[0], l2[1], l1[1]);

        if (o1 !== o2 && o3 !== o4) return true;

        if (o1 === 0 && onSegment(l1[0], l2[0], l1[1])) return true;
        if (o2 === 0 && onSegment(l1[0], l2[1], l1[1])) return true;
        if (o3 === 0 && onSegment(l2[1], l1[0], l2[1])) return true;
        if (o4 === 0 && onSegment(l2[1], l1[1], l2[1])) return true;

        return false;
    }

    function orient(p, q, r) {
        var val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
        if (Math.abs(val) < 0.000001) return 0;
        return val > 0 ? 1 : 2;
    }

    function onSegment(p, q, r) {
        return q[0] <= Math.max(p[0], r[0]) && q[0] >= Math.min(p[0], r[0]) && q[1] <= Math.max(p[1], r[1]) && q[1] >= Math.min(p[1], r[1]);
    }

    geotools.transform = function (features, matrix, center) {
        if (Array.isArray(features)) {
            features.forEach(function (feature) {
                return transformFeature(feature, matrix, center);
            });
        } else {
            transformFeature(features, matrix, center);
        }
    };

    geotools.rotate = function (features, angle, center) {
        var sin = Math.sin(angle);
        var cos = Math.cos(angle);

        geotools.transform(features, [[cos, sin, 0], [-sin, cos, 0], [0, 0, 1]], center);
    };

    geotools.scale = function (features, scale, center) {
        geotools.transform(features, [[scale[0], 0, 0], [0, scale[1], 0], [0, 0, 1]], center);
    };

    geotools.move = function (features, translate) {
        geotools.transform(features, [[1, 0, 0], [0, 1, 1], [translate[0], translate[1], 1]], [0, 0]);
    };

    function transformFeature(feature, matrix, center) {
        var base = center.crs ? center.projectTo(feature.crs).position : center;
        if (feature.rings) {
            var rings = feature.rings;
            transformRings(rings, matrix, base);
            feature.rings = rings;
        } else if (feature.points) {
            feature.points = transformRing(feature.points, matrix, base);
        } else if (feature.position) {
            feature.position = transformRing([feature.position], matrix, base)[0];
        }
    }

    function transformRings(rings, matrix, base) {
        rings.forEach(function (ring, index) {
            rings[index] = transformRing(ring, matrix, base);
        });
    }

    function transformRing(ring, matrix, base) {
        math.extendCoordinates(ring, base);
        var transformed = math.multiplyMatrix(ring, matrix);
        math.collapseCoordinates(transformed, base);
        return transformed;
    }

    return geotools;
});
'use strict';

sGis.module('init', ['sGis', 'Map', 'painter.DomPainter'], function (sGis, Map, Painter) {

    'use strict';

    function init(_ref) {
        var position = _ref.position,
            resolution = _ref.resolution,
            crs = _ref.crs,
            layers = _ref.layers,
            wrapper = _ref.wrapper,
            _ref$plugins = _ref.plugins,
            plugins = _ref$plugins === undefined ? [] : _ref$plugins;

        var map = new Map({ crs: crs, position: position, resolution: resolution, layers: layers });
        var painter = new Painter(map, { wrapper: wrapper });

        plugins = plugins.map(function (pluginDefinition) {
            var name = pluginDefinition.name;
            if (!sGis.plugins || !sGis.plugins[name]) {
                console.warn('Plugin ' + name + ' is not available. Skipping.');
                return null;
            }

            return new sGis.plugins[name](map, painter.innerWrapper, pluginDefinition.properties);
        });

        return { map: map, painter: painter, plugins: plugins };
    }

    return init;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('Layer', ['utils', 'EventHandler'], function (utils, EventHandler) {
    'use strict';

    var defaults = {
        _isDisplayed: true,
        _opacity: 1.0,
        _resolutionLimits: [-1, -1]
    };

    var Layer = function (_EventHandler) {
        _inherits(Layer, _EventHandler);

        function Layer(properties) {
            _classCallCheck(this, Layer);

            var _this = _possibleConstructorReturn(this, (Layer.__proto__ || Object.getPrototypeOf(Layer)).call(this));

            utils.init(_this, properties);
            return _this;
        }

        _createClass(Layer, [{
            key: 'getFeatures',
            value: function getFeatures(bbox, resolution) {
                return [];
            }
        }, {
            key: 'checkVisibility',
            value: function checkVisibility(resolution) {
                return this._isDisplayed && (this.resolutionLimits[0] < 0 || resolution >= this.resolutionLimits[0]) && (this.resolutionLimits[1] < 0 || resolution <= this.resolutionLimits[1]);
            }
        }, {
            key: 'show',
            value: function show() {
                this.isDisplayed = true;
            }
        }, {
            key: 'hide',
            value: function hide() {
                this.isDisplayed = false;
            }
        }, {
            key: 'getOpacity',
            value: function getOpacity() {
                return this._opacity;
            }
        }, {
            key: 'setOpacity',
            value: function setOpacity(opacity) {
                opacity = opacity < 0 ? 0 : opacity > 1 ? 1 : opacity;
                this._opacity = opacity;
                this.fire('propertyChange', { property: 'opacity' });
            }
        }, {
            key: 'redraw',
            value: function redraw() {
                this.fire('propertyChange', { property: 'content' });
            }
        }, {
            key: 'isDisplayed',
            get: function get() {
                return this._isDisplayed;
            },
            set: function set(bool) {
                this._isDisplayed = bool;

                this.fire('visibilityChange');
            }
        }, {
            key: 'opacity',
            get: function get() {
                return this.getOpacity();
            },
            set: function set(opacity) {
                this.setOpacity(opacity);
            }
        }, {
            key: 'resolutionLimits',
            get: function get() {
                return this._resolutionLimits;
            },
            set: function set(limits) {
                this._resolutionLimits = limits;
                this.fire('propertyChange', { property: 'resolutionLimits' });
            }
        }]);

        return Layer;
    }(EventHandler);

    Layer.prototype.delayedUpdate = false;

    utils.extend(Layer.prototype, defaults);

    return Layer;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('LayerGroup', ['utils', 'EventHandler'], function (utils, EventHandler) {

    'use strict';

    var LayerGroup = function (_EventHandler) {
        _inherits(LayerGroup, _EventHandler);

        function LayerGroup() {
            var layers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            _classCallCheck(this, LayerGroup);

            var _this = _possibleConstructorReturn(this, (LayerGroup.__proto__ || Object.getPrototypeOf(LayerGroup)).call(this));

            _this._layers = [];
            _this._forwardEvent = function (sGisEvent) {
                _this.fire(sGisEvent.eventType, sGisEvent);
            };
            _this._fireContentChange = function () {
                _this.fire('contentsChange');
            };

            _this.layers = layers || [];
            return _this;
        }

        _createClass(LayerGroup, [{
            key: 'addLayer',
            value: function addLayer(layer) {
                if (layer === this) utils.error('Cannot add self to the group');
                if (this.getLayers(true).indexOf(layer) !== -1) {
                    utils.error('Cannot add layer to the group: the layer is already in the group');
                }

                this._layers.push(layer);
                this._setChildListeners(layer);

                if (layer instanceof LayerGroup) {
                    this._setForwardListeners(layer);
                }

                this.fire('layerAdd', { layer: layer });
                this.fire('contentsChange');
            }
        }, {
            key: 'removeLayer',
            value: function removeLayer(layer, recurse) {
                var index = this._layers.indexOf(layer);
                if (index !== -1) {
                    this._layers.splice(index, 1);
                    this._removeChildListeners(layer);
                    if (layer instanceof LayerGroup) {
                        this._removeForwardListeners(layer);
                    }
                    this.fire('layerRemove', { layer: layer });
                    this.fire('contentsChange');
                    return;
                } else if (recurse) {
                    for (var i = 0, l = this._layers.length; i < l; i++) {
                        if (this._layers[i] instanceof LayerGroup && this._layers[i].contains(layer)) {
                            this._layers[i].removeLayer(layer, true);
                            return;
                        }
                    }
                }

                utils.error('The layer is not in the group');
            }
        }, {
            key: '_setChildListeners',
            value: function _setChildListeners(layer) {
                layer.on('visibilityChange', this._fireContentChange);
            }
        }, {
            key: '_removeChildListeners',
            value: function _removeChildListeners(layer) {
                layer.off('visibilityChange', this._fireContentChange);
            }
        }, {
            key: '_setForwardListeners',
            value: function _setForwardListeners(layerGroup) {
                layerGroup.on('layerAdd layerRemove layerOrderChange contentsChange', this._forwardEvent);
            }
        }, {
            key: '_removeForwardListeners',
            value: function _removeForwardListeners(layerGroup) {
                layerGroup.off('layerAdd layerRemove layerOrderChange contentsChange', this._forwardEvent);
            }
        }, {
            key: 'contains',
            value: function contains(layer) {
                for (var i = 0, l = this._layers.length; i < l; i++) {
                    if (this._layers[i] instanceof LayerGroup && this._layers[i].contains(layer) || this._layers[i] === layer) {
                        return true;
                    }
                }
                return false;
            }
        }, {
            key: 'indexOf',
            value: function indexOf(layer) {
                return this._layers.indexOf(layer);
            }
        }, {
            key: 'insertLayer',
            value: function insertLayer(layer, index) {
                var currIndex = this._layers.indexOf(layer);

                if (currIndex === -1) {
                    this.prohibitEvent('layerAdd');
                    this.addLayer(layer);
                    this.allowEvent('layerAdd');
                    currIndex = this._layers.length - 1;
                    var added = true;
                }

                var length = this._layers.length;
                index = index > length ? length : index < 0 && index < -length ? -length : index;
                if (index < 0) index = length + index;

                this._layers.splice(currIndex, 1);
                this._layers.splice(index, 0, layer);
                var event = added ? 'layerAdd' : 'layerOrderChange';
                this.fire(event, { layer: layer });
                this.fire('contentsChange');
            }
        }, {
            key: 'moveLayerToTop',
            value: function moveLayerToTop(layer) {
                this.insertLayer(layer, -1);
            }
        }, {
            key: 'getLayers',
            value: function getLayers(recurse, excludeInactive) {
                var layers = [];
                this._layers.forEach(function (layer) {
                    if (excludeInactive && !layer.isDisplayed) return;

                    if (recurse && layer instanceof LayerGroup) {
                        layers = layers.concat(layer.getLayers(recurse, excludeInactive));
                    } else {
                        layers.push(layer);
                    }
                });
                return layers;
            }
        }, {
            key: 'show',
            value: function show() {
                this.isDisplayed = true;
            }
        }, {
            key: 'hide',
            value: function hide() {
                this.isDisplayed = false;
            }
        }, {
            key: 'layers',
            get: function get() {
                return [].concat(this._layers);
            },
            set: function set(layers) {
                var list = this.layers;
                for (var i = 0; i < list.length; i++) {
                    this.removeLayer(list[i]);
                }

                for (i = 0; i < layers.length; i++) {
                    this.addLayer(layers[i]);
                }
            }
        }, {
            key: 'isDisplayed',
            get: function get() {
                return this._isDisplayed;
            },
            set: function set(bool) {
                if (this._isDisplayed !== bool) {
                    this._isDisplayed = bool;
                    this.fire('visibilityChange');
                }
            }
        }]);

        return LayerGroup;
    }(EventHandler);

    LayerGroup.prototype.isDisplayed = true;

    return LayerGroup;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('Map', ['utils', 'CRS', 'Point', 'Bbox', 'LayerGroup', 'TileScheme'], function (utils, CRS, Point, Bbox, LayerGroup, TileScheme) {
    'use strict';

    var Map = function (_LayerGroup) {
        _inherits(Map, _LayerGroup);

        function Map() {
            var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            _classCallCheck(this, Map);

            var _this = _possibleConstructorReturn(this, (Map.__proto__ || Object.getPrototypeOf(Map)).call(this));

            if (properties.crs) _this.crs = properties.crs;
            _this.position = properties.position || [_this.position[0], _this.position[1]];
            utils.extend(_this, properties, true);

            _this._listenForBboxChange();
            return _this;
        }

        _createClass(Map, [{
            key: '_listenForBboxChange',
            value: function _listenForBboxChange() {
                var _this2 = this;

                this.on('bboxChange', function () {
                    if (_this2._changeTimer) clearTimeout(_this2._changeTimer);
                    _this2._changeTimer = setTimeout(function () {
                        _this2._changeTimer = null;
                        _this2.fire('bboxChangeEnd');
                    }, _this2.changeEndDelay);
                });
            }
        }, {
            key: 'move',
            value: function move(dx, dy) {
                this._position[0] += dx;
                this._position[1] += dy;
                this.fire('bboxChange');
            }
        }, {
            key: 'changeScale',
            value: function changeScale(scalingK, basePoint, doNotAdjust) {
                var resolution = this.resolution;
                this.setResolution(resolution * scalingK, basePoint, doNotAdjust);
            }
        }, {
            key: 'animateChangeScale',
            value: function animateChangeScale(scalingK, basePoint) {
                this.animateSetResolution(this.resolution * scalingK, basePoint);
            }
        }, {
            key: 'zoom',
            value: function zoom(k, basePoint) {
                var tileScheme = this.tileScheme;
                var currResolution = this._animationTarget ? this._animationTarget[1] : this.resolution;

                var resolution = void 0;
                if (tileScheme) {
                    var level = tileScheme.getLevel(currResolution) + (k > 0 ? -1 : 1);
                    resolution = tileScheme.levels[level] ? tileScheme.levels[level].resolution : currResolution;
                } else {
                    resolution = currResolution * Math.pow(2, -k);
                }

                resolution = Math.min(Math.max(resolution, this.minResolution || 0), this.maxResolution || Number.MAX_VALUE);
                this.animateSetResolution(resolution, basePoint);
            }
        }, {
            key: 'adjustResolution',
            value: function adjustResolution() {
                var resolution = this.resolution;
                var newResolution = this.getAdjustedResolution(resolution);
                var ratio = newResolution / resolution;
                if (ratio > 1.1 || ratio < 0.9) {
                    this.animateSetResolution(newResolution);
                } else if (ratio > 1.0001 || ratio < 0.9999) {
                    this.setResolution(newResolution);
                }
            }
        }, {
            key: 'getAdjustedResolution',
            value: function getAdjustedResolution(resolution) {
                if (!this.tileScheme) return resolution;
                return this.tileScheme.getAdjustedResolution(resolution);
            }
        }, {
            key: 'animateSetResolution',
            value: function animateSetResolution(resolution, basePoint) {
                var adjustedResolution = this.getAdjustedResolution(resolution);
                var newPosition = this._getScaledPosition(adjustedResolution, basePoint);
                this.animateTo(newPosition, adjustedResolution);
                this.fire('animationStart');
            }
        }, {
            key: 'animateTo',
            value: function animateTo(point, resolution) {
                this.stopAnimation();

                var originalPosition = this.centerPoint;
                var originalResolution = this.resolution;
                var dx = point.x - originalPosition.x;
                var dy = point.y - originalPosition.y;
                var dr = resolution - originalResolution;
                var startTime = Date.now();
                this._animationStopped = false;
                this._animationTarget = [point, resolution];

                var self = this;
                this.animationTimer = setInterval(function () {
                    var time = Date.now() - startTime;
                    if (time >= self.animationTime || self._animationStopped) {
                        self.setPosition(point, resolution);
                        self.stopAnimation();
                        self.fire('animationEnd');
                    } else {
                        var x = self._easeFunction(time, originalPosition.x, dx, self.animationTime);
                        var y = self._easeFunction(time, originalPosition.y, dy, self.animationTime);
                        var r = self._easeFunction(time, originalResolution, dr, self.animationTime);
                        self.setPosition(new Point([x, y], self.crs), r);
                    }
                }, 1000 / 60);
            }
        }, {
            key: '_getScaledPosition',
            value: function _getScaledPosition(newResolution, basePoint) {
                var position = this.centerPoint;
                basePoint = basePoint ? basePoint.projectTo(this.crs) : position;
                var resolution = this.resolution;
                var scalingK = newResolution / resolution;
                return new Point([(position.x - basePoint.x) * scalingK + basePoint.x, (position.y - basePoint.y) * scalingK + basePoint.y], position.crs);
            }
        }, {
            key: 'stopAnimation',
            value: function stopAnimation() {
                this._animationStopped = true;
                this._animationTarget = null;
                clearInterval(this.animationTimer);
            }
        }, {
            key: '_easeFunction',
            value: function _easeFunction(t, b, c, d) {
                return b + c * t / d;
            }
        }, {
            key: 'setPosition',
            value: function setPosition(point, resolution) {
                this.prohibitEvent('bboxChange');
                this.centerPoint = point;
                if (resolution) this.resolution = resolution;
                this.allowEvent('bboxChange');
                this.fire('bboxChange');
            }
        }, {
            key: 'setResolution',
            value: function setResolution(resolution, basePoint, doNotAdjust) {
                this.setPosition(this._getScaledPosition(this.resolution, basePoint), doNotAdjust ? resolution : this.getAdjustedResolution(resolution));
            }
        }, {
            key: 'position',
            get: function get() {
                return this._position;
            },
            set: function set(position) {
                this._position = position;
                this.fire('bboxChange');
            }
        }, {
            key: 'centerPoint',
            get: function get() {
                return new Point(this.position, this.crs);
            },
            set: function set(point) {
                this.position = point.projectTo(this.crs).position;
            }
        }, {
            key: 'crs',
            get: function get() {
                return this._crs;
            },
            set: function set(crs) {
                var projection = this._crs.projectionTo(crs);
                this._crs = crs;
                if (projection) {
                    this.position = projection(this.position);
                } else {
                    this.position = [0, 0];
                }
            }
        }, {
            key: 'resolution',
            get: function get() {
                return this._resolution;
            },
            set: function set(resolution) {
                this._resolution = resolution;
                this.fire('bboxChange');
            }
        }, {
            key: 'minResolution',
            get: function get() {
                return this._minResolution || this.tileScheme && this.tileScheme.minResolution;
            },
            set: function set(resolution) {
                if (resolution !== null) {
                    var maxResolution = this.maxResolution;
                    if (resolution < maxResolution) utils.error('maxResolution cannot be less then minResolution');
                }
                this._minResolution = resolution;
                if (this.resolution > this.minResolution) this.resolution = resolution;
            }
        }, {
            key: 'maxResolution',
            get: function get() {
                return this._maxResolution || this.tileScheme && this.tileScheme.maxResolution;
            },
            set: function set(resolution) {
                if (resolution !== null) {
                    var minResolution = this.minResolution;
                    if (resolution < minResolution) utils.error('maxResolution cannot be less then minResolution');
                }
                this._maxResolution = resolution;
                if (this.resolution > this.maxResolution) this.resolution = resolution;
            }
        }]);

        return Map;
    }(LayerGroup);

    Object.assign(Map.prototype, {
        _crs: CRS.webMercator,
        _position: new Point([55.755831, 37.617673]).projectTo(CRS.webMercator).position,
        _resolution: 611.4962262812505 / 2,

        tileScheme: TileScheme.default,

        animationTime: 300,

        changeEndDelay: 300
    });

    return Map;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

sGis.module('Point', ['utils', 'CRS'], function (utils, CRS) {
    'use strict';

    var defaults = {
        position: [0, 0],

        _crs: CRS.geo
    };

    var Point = function () {
        function Point(position, crs) {
            _classCallCheck(this, Point);

            if (crs !== undefined) this._crs = crs;
            this.position = position;
        }

        _createClass(Point, [{
            key: 'projectTo',
            value: function projectTo(newCrs) {
                var projection = this.crs.projectionTo(newCrs);
                if (projection === null) utils.error("Cannot project point to crs: " + newCrs.stringDescription);

                return new Point(projection(this.position), newCrs);
            }
        }, {
            key: 'clone',
            value: function clone() {
                return new Point(this.position, this.crs);
            }
        }, {
            key: 'equals',
            value: function equals(point) {
                return utils.softEquals(point.x, this.x) && utils.softEquals(point.y, this.y) && point.crs.equals(this.crs);
            }
        }, {
            key: 'position',
            get: function get() {
                return [].concat(this._position);
            },
            set: function set(position) {
                this._position = position;
            }
        }, {
            key: 'point',
            get: function get() {
                return this.clone();
            },
            set: function set(point) {
                this.position = point.projectTo(this.crs).position;
            }
        }, {
            key: 'x',
            get: function get() {
                return this._position[0];
            },
            set: function set(x) {
                this._position[0] = x;
            }
        }, {
            key: 'y',
            get: function get() {
                return this._position[1];
            },
            set: function set(y) {
                this._position[1] = y;
            }
        }, {
            key: 'crs',
            get: function get() {
                return this._crs;
            }
        }]);

        return Point;
    }();

    utils.extend(Point.prototype, defaults);

    return Point;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('TileLayer', ['utils', 'TileScheme', 'Layer', 'Point', 'Bbox', 'feature.Image', 'CRS', 'symbol.image.Image'], function (utils, TileScheme, Layer, Point, Bbox, ImageF, CRS, ImageSymbol) {
    'use strict';

    var defaults = {
        tileScheme: TileScheme.default,

        crs: CRS.webMercator,

        cycleX: true,

        cycleY: false,

        _transitionTime: 200,
        _cacheSize: 256
    };

    var TileLayer = function (_Layer) {
        _inherits(TileLayer, _Layer);

        function TileLayer(tileSource, options) {
            _classCallCheck(this, TileLayer);

            var _this = _possibleConstructorReturn(this, (TileLayer.__proto__ || Object.getPrototypeOf(TileLayer)).call(this, options));

            _this._updateSymbol();

            _this._source = tileSource;
            _this._tiles = {};
            return _this;
        }

        _createClass(TileLayer, [{
            key: 'getTileUrl',
            value: function getTileUrl(xIndex, yIndex, scale) {
                var url = this._source;
                return url.replace('{x}', xIndex).replace('{y}', yIndex).replace('{z}', scale);
            }
        }, {
            key: 'getFeatures',
            value: function getFeatures(bbox, resolution) {
                var ownCrs = this.crs || bbox.crs;
                if (!ownCrs.canProjectTo(bbox.crs)) return [];
                if (!this.checkVisibility(resolution)) return [];

                var level = this.tileScheme.getLevel(resolution);
                if (level < 0) return [];

                bbox = bbox.projectTo(ownCrs);

                var layerResolution = this.tileScheme.levels[level].resolution;
                if (layerResolution * 2 < resolution) return [];

                var xStartIndex = Math.floor((bbox.xMin - this.tileScheme.origin[0]) / this.tileWidth / layerResolution);
                var xEndIndex = Math.ceil((bbox.xMax - this.tileScheme.origin[0]) / this.tileWidth / layerResolution);
                var yStartIndex = Math.floor((this.tileScheme.origin[1] - bbox.yMax) / this.tileHeight / layerResolution);
                var yEndIndex = Math.ceil((this.tileScheme.origin[1] - bbox.yMin) / this.tileHeight / layerResolution);

                var tiles = this._tiles;
                var features = [];
                for (var xIndex = xStartIndex; xIndex < xEndIndex; xIndex++) {
                    var xIndexAdj = this.cycleX ? this._getAdjustedIndex(xIndex, level) : xIndex;

                    for (var yIndex = yStartIndex; yIndex < yEndIndex; yIndex++) {
                        var yIndexAdj = this.cycleY ? this._getAdjustedIndex(yIndex, level) : yIndex;
                        var tileId = TileLayer.getTileId(this.tileScheme.levels[level].zIndex, xIndex, yIndex);

                        if (!tiles[tileId]) {
                            var imageBbox = this._getTileBbox(level, xIndex, yIndex);
                            var tileUrl = this.getTileUrl(xIndexAdj, yIndexAdj, this.tileScheme.levels[level].zIndex);
                            tiles[tileId] = new ImageF(imageBbox, { src: tileUrl, symbol: this._symbol, crs: this.crs });
                        }

                        features.push(tiles[tileId]);
                    }
                }

                this._cutCache();
                return features;
            }
        }, {
            key: '_getTileBbox',
            value: function _getTileBbox(level, xIndex, yIndex) {
                var resolution = this.tileScheme.levels[level].resolution;
                var startPoint = new Point([xIndex * this.tileWidth * resolution + this.tileScheme.origin[0], -(yIndex + 1) * this.tileHeight * resolution + this.tileScheme.origin[1]], this.crs);
                var endPoint = new Point([(xIndex + 1) * this.tileWidth * resolution + this.tileScheme.origin[0], -yIndex * this.tileHeight * resolution + this.tileScheme.origin[1]], this.crs);

                return new Bbox(startPoint.position, endPoint.position, this.crs);
            }
        }, {
            key: '_getAdjustedIndex',
            value: function _getAdjustedIndex(index, level) {
                var desc = this.tileScheme.levels[level];
                if (!desc.indexCount || desc.indexCount <= 0 || index >= 0 && index < desc.indexCount) return index;
                while (index < 0) {
                    index += desc.indexCount;
                }return index % desc.indexCount;
            }
        }, {
            key: '_cutCache',
            value: function _cutCache() {
                var _this2 = this;

                var keys = Object.keys(this._tiles);
                if (keys.length > this._cacheSize) {
                    var forDeletion = keys.slice(0, keys.length - this._cacheSize);
                    forDeletion.forEach(function (key) {
                        delete _this2._tiles[key];
                    });
                }
            }
        }, {
            key: '_updateSymbol',
            value: function _updateSymbol() {
                this._symbol = new ImageSymbol({ opacity: this.opacity, transitionTime: this.transitionTime });
            }
        }, {
            key: '_clearFeaturesCache',
            value: function _clearFeaturesCache() {
                var _this3 = this;

                Object.keys(this._tiles).forEach(function (key) {
                    _this3._tiles[key].redraw();
                });
            }
        }, {
            key: '_updateFeatures',
            value: function _updateFeatures() {
                var _this4 = this;

                Object.keys(this._tiles).forEach(function (key) {
                    var cache = _this4._tiles[key].getRenderCache();
                    if (!cache || !cache.renders || !cache.renders[0]) return;
                    var image = cache.renders[0].getCache();
                    if (image) image.style.opacity = _this4._symbol.opacity;
                });
            }
        }, {
            key: 'tileWidth',
            get: function get() {
                return this.tileScheme.tileWidth;
            }
        }, {
            key: 'tileHeight',
            get: function get() {
                return this.tileScheme.tileHeight;
            }
        }, {
            key: 'opacity',
            get: function get() {
                return this._opacity;
            },
            set: function set(opacity) {
                opacity = opacity < 0 ? 0 : opacity > 1 ? 1 : opacity;
                this._opacity = opacity;
                this._symbol.opacity = opacity;

                this._updateFeatures();

                this.fire('propertyChange', { property: 'opacity' });
            }
        }, {
            key: 'transitionTime',
            get: function get() {
                return this._transitionTime;
            },
            set: function set(time) {
                this._transitionTime = this._symbol.transitionTime = time;
                this._updateFeatures();

                this.fire('propertyChange', { property: 'transitionTime' });
            }
        }], [{
            key: 'getTileId',
            value: function getTileId(level, xIndex, yIndex) {
                return [level, xIndex, yIndex].join(',');
            }
        }]);

        return TileLayer;
    }(Layer);

    utils.extend(TileLayer.prototype, defaults);

    return TileLayer;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

sGis.module('TileScheme', ['utils', 'math'], function (utils, math) {
    var TileScheme = function () {
        function TileScheme() {
            var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            _classCallCheck(this, TileScheme);

            utils.init(this, parameters, true);
        }

        _createClass(TileScheme, [{
            key: 'getAdjustedResolution',
            value: function getAdjustedResolution(resolution) {
                return this.levels[this.getLevel(resolution)].resolution;
            }
        }, {
            key: 'getLevel',
            value: function getLevel(resolution) {
                if (!this.levels || this.levels.length === 0) utils.error('Tile scheme levels are not set');

                for (var i = 0; i < this.levels.length; i++) {
                    if (resolution <= this.levels[i].resolution + math.tolerance) return i;
                }
                return i - 1;
            }
        }, {
            key: 'levels',
            get: function get() {
                return this._levels;
            },
            set: function set(levels) {
                this._levels = levels.sort(function (a, b) {
                    return a.resolution - b.resolution;
                });
            }
        }, {
            key: 'maxResolution',
            get: function get() {
                return this.levels[this.levels.length - 1].resolution;
            }
        }, {
            key: 'minResolution',
            get: function get() {
                return this.levels[0].resolution;
            }
        }, {
            key: 'origin',
            get: function get() {
                return this._origin;
            },
            set: function set(origin) {
                this._origin = origin;
            }
        }]);

        return TileScheme;
    }();

    var defaultLevels = [{
        resolution: 156543.03392800014,
        scale: 591657527.591555,
        indexCount: 1,
        zIndex: 0
    }];

    for (var i = 1; i < 18; i++) {
        defaultLevels[i] = {
            resolution: defaultLevels[i - 1].resolution / 2,
            scale: defaultLevels[i - 1].scale / 2,
            indexCount: defaultLevels[i - 1] * 2,
            zIndex: i
        };
    }

    TileScheme.default = new TileScheme({
        tileWidth: 256,
        tileHeight: 256,
        origin: [-20037508.342787, 20037508.342787],
        levels: defaultLevels
    });

    return TileScheme;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('controls.Circle', ['controls.PolyDrag', 'feature.Polygon'], function (PolyDrag, Polygon) {

    'use strict';

    var Circle = function (_PolyDrag) {
        _inherits(Circle, _PolyDrag);

        function Circle() {
            _classCallCheck(this, Circle);

            return _possibleConstructorReturn(this, (Circle.__proto__ || Object.getPrototypeOf(Circle)).apply(this, arguments));
        }

        _createClass(Circle, [{
            key: '_startNewFeature',
            value: function _startNewFeature(point) {
                this._centerPoint = point.position;
                this._activeFeature = new Polygon([[]], { crs: point.crs, symbol: this.symbol });
                this.tempLayer.add(this._activeFeature);
            }
        }, {
            key: '_updateFeature',
            value: function _updateFeature(point) {
                var radius = Math.sqrt(Math.pow(this._centerPoint[0] - point.position[0], 2) + Math.pow(this._centerPoint[1] - point.position[1], 2));
                var angleStep = 2 * Math.PI / this.segmentNo;

                var coordinates = [];
                for (var i = 0; i < this.segmentNo; i++) {
                    coordinates.push([this._centerPoint[0] + radius * Math.sin(angleStep * i), this._centerPoint[1] + radius * Math.cos(angleStep * i)]);
                }

                this._activeFeature.rings = [coordinates];
            }
        }]);

        return Circle;
    }(PolyDrag);

    Circle.prototype.segmentNo = 36;

    return Circle;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('Control', ['utils', 'EventHandler'], function (utils, EventHandler) {

    'use strict';

    var Control = function (_EventHandler) {
        _inherits(Control, _EventHandler);

        function Control(map, properties) {
            _classCallCheck(this, Control);

            var _this = _possibleConstructorReturn(this, (Control.__proto__ || Object.getPrototypeOf(Control)).call(this));

            _this._map = map;
            utils.init(_this, properties, true);
            return _this;
        }

        _createClass(Control, [{
            key: 'activate',
            value: function activate() {
                this.isActive = true;
            }
        }, {
            key: 'deactivate',
            value: function deactivate() {
                this.isActive = false;
            }
        }, {
            key: '_activate',
            value: function _activate() {}
        }, {
            key: '_deactivate',
            value: function _deactivate() {}
        }, {
            key: 'activeLayer',
            get: function get() {
                return this._activeLayer;
            },
            set: function set(layer) {
                this._activeLayer = layer;
            }
        }, {
            key: 'isActive',
            get: function get() {
                return this._isActive;
            },
            set: function set(bool) {
                bool = !!bool;
                if (this._isActive === bool) return;
                this._isActive = bool;

                if (bool) {
                    this._activate();
                } else {
                    this._deactivate();
                }
            }
        }, {
            key: 'map',
            get: function get() {
                return this._map;
            }
        }]);

        return Control;
    }(EventHandler);

    Control.prototype._isActive = false;

    return Control;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('controls.Editor', ['utils', 'Control', 'symbol.Editor', 'controls.PointEditor', 'controls.PolyEditor', 'controls.PolyTransform', 'utils.StateManager', 'event'], function (utils, Control, EditorSymbol, PointEditor, PolyEditor, PolyTransform, StateManager, event) {

    'use strict';

    var modes = ['vertex', 'rotate', 'scale', 'drag'];

    var Editor = function (_Control) {
        _inherits(Editor, _Control);

        function Editor(map, options) {
            _classCallCheck(this, Editor);

            var _this = _possibleConstructorReturn(this, (Editor.__proto__ || Object.getPrototypeOf(Editor)).call(this, map, options));

            _this._ns = '.' + utils.getGuid();
            _this._setListener = _this._setListener.bind(_this);
            _this._removeListener = _this._removeListener.bind(_this);
            _this._saveState = _this._saveState.bind(_this);
            _this._setEditors();

            _this._states = new StateManager();

            _this._deselect = _this._deselect.bind(_this);
            _this.setMode(modes);

            _this._handleFeatureAdd = _this._handleFeatureAdd.bind(_this);
            _this._handleFeatureRemove = _this._handleFeatureRemove.bind(_this);

            _this._handleKeyDown = _this._handleKeyDown.bind(_this);
            return _this;
        }

        _createClass(Editor, [{
            key: '_setEditors',
            value: function _setEditors() {
                this._pointEditor = new PointEditor(this.map);
                this._pointEditor.on('edit', this._saveState);

                this._polyEditor = new PolyEditor(this.map, { onFeatureRemove: this._delete.bind(this) });
                this._polyEditor.on('edit', this._saveState);
                this._polyEditor.on('change', this._updateTransformControl.bind(this));

                this._polyTransform = new PolyTransform(this.map);
                this._polyTransform.on('rotationEnd scalingEnd', this._saveState);
            }
        }, {
            key: '_activate',
            value: function _activate() {
                if (!this.activeLayer) return;
                this.activeLayer.features.forEach(this._setListener, this);
                this.activeLayer.on('featureAdd', this._handleFeatureAdd);
                this.activeLayer.on('featureRemove', this._handleFeatureRemove);
                this.map.on('click', this._onMapClick.bind(this));

                event.add(document, 'keydown', this._handleKeyDown);
            }
        }, {
            key: '_handleFeatureAdd',
            value: function _handleFeatureAdd(sGisEvent) {
                this._setListener(sGisEvent.feature);
            }
        }, {
            key: '_handleFeatureRemove',
            value: function _handleFeatureRemove(sGisEvent) {
                this._removeListener(sGisEvent.feature);
            }
        }, {
            key: '_setListener',
            value: function _setListener(feature) {
                feature.on('click' + this._ns, this._handleFeatureClick.bind(this, feature));
            }
        }, {
            key: '_removeListener',
            value: function _removeListener(feature) {
                feature.off('click' + this._ns);
            }
        }, {
            key: '_onMapClick',
            value: function _onMapClick() {
                if (!this.ignoreEvents) this._deactivate();
            }
        }, {
            key: '_deactivate',
            value: function _deactivate() {
                this._deselect();
                this.activeLayer.features.forEach(this._removeListener, this);
                this.activeLayer.off('featureAdd', this._handleFeatureAdd);
                this.activeLayer.off('featureRemove', this._handleFeatureRemove);
                this.map.off('click', this._deselect);

                event.remove(document, 'keydown', this._handleKeyDown);
            }
        }, {
            key: 'select',
            value: function select(feature) {
                this.activeFeature = feature;
            }
        }, {
            key: 'deselect',
            value: function deselect() {
                this.activeFeature = null;
            }
        }, {
            key: '_handleFeatureClick',
            value: function _handleFeatureClick(feature, sGisEvent) {
                if (this.ignoreEvents) return;
                sGisEvent.stopPropagation();
                this._select(feature);
            }
        }, {
            key: '_select',
            value: function _select(feature) {
                if (this._activeFeature === feature) return;
                this._deselect();

                this._activeFeature = feature;
                if (!feature) return;

                feature.setTempSymbol(new EditorSymbol({ baseSymbol: feature.symbol }));
                if (feature.position) {
                    this._pointEditor.activeLayer = this.activeLayer;
                    this._pointEditor.activeFeature = feature;
                } else if (feature.rings) {
                    this._activatePolyControls(feature);
                }
                this.activeLayer.redraw();

                this._saveState();

                this.fire('featureSelect', { feature: feature });
            }
        }, {
            key: '_activatePolyControls',
            value: function _activatePolyControls(feature) {
                this._polyEditor.featureDragAllowed = this._dragging;
                this._polyEditor.vertexChangeAllowed = this._vertexEditing;
                this._polyEditor.activeLayer = this.activeLayer;
                this._polyEditor.activeFeature = feature;

                this._polyTransform.enableRotation = this._rotation;
                this._polyTransform.enableScaling = this._scaling;
                this._polyTransform.activeLayer = this.activeLayer;
                this._polyTransform.activeFeature = feature;
            }
        }, {
            key: '_deselect',
            value: function _deselect() {
                if (!this._activeFeature || !this._deselectAllowed) return;

                this._pointEditor.deactivate();
                this._polyEditor.deactivate();
                this._polyTransform.deactivate();

                var feature = this._activeFeature;

                this._activeFeature.clearTempSymbol();
                this._activeFeature = null;
                this.activeLayer.redraw();

                this.fire('featureDeselect', { feature: feature });
            }
        }, {
            key: '_updateTransformControl',
            value: function _updateTransformControl() {
                if (this._polyTransform.isActive) this._polyTransform.update();
            }
        }, {
            key: 'setMode',
            value: function setMode(mode) {
                if (mode === 'all') mode = modes;
                if (!Array.isArray(mode)) mode = mode.split(',').map(function (x) {
                    return x.trim();
                });

                this._vertexEditing = mode.indexOf('vertex') >= 0;
                this._rotation = mode.indexOf('rotate') >= 0;
                this._dragging = mode.indexOf('drag') >= 0;
                this._scaling = mode.indexOf('scale') >= 0;

                if (this._activeFeature && this._activeFeature.rings) {
                    this._polyEditor.deactivate();
                    this._polyTransform.deactivate();
                    this._activatePolyControls(this._activeFeature);
                }
            }
        }, {
            key: 'allowDeselect',
            value: function allowDeselect() {
                this._deselectAllowed = true;
            }
        }, {
            key: 'prohibitDeselect',
            value: function prohibitDeselect() {
                this._deselectAllowed = false;
            }
        }, {
            key: '_delete',
            value: function _delete() {
                if (this._deselectAllowed && this.allowDeletion && this._activeFeature) {
                    var feature = this._activeFeature;
                    this.prohibitEvent('featureDeselect');
                    this._deselect();
                    this.allowEvent('featureDeselect');
                    this.activeLayer.remove(feature);

                    this._saveState();
                    this.fire('featureRemove', { feature: feature });
                }
            }
        }, {
            key: '_handleKeyDown',
            value: function _handleKeyDown(event) {
                switch (event.which) {
                    case 27:
                        this._deselect();return false;
                    case 46:
                        this._delete();return false;
                    case 90:
                        if (event.ctrlKey) {
                            this.undo();return false;
                        }break;
                    case 89:
                        if (event.ctrlKey) {
                            this.redo();return false;
                        }break;}
            }
        }, {
            key: '_saveState',
            value: function _saveState() {
                this._states.setState({ feature: this._activeFeature, coordinates: this._activeFeature && this._activeFeature.coordinates });
            }
        }, {
            key: 'undo',
            value: function undo() {
                this._setState(this._states.undo());
            }
        }, {
            key: 'redo',
            value: function redo() {
                this._setState(this._states.redo());
            }
        }, {
            key: '_setState',
            value: function _setState(state) {
                if (!state) return this._deselect();

                if (!state.coordinates && this.activeLayer.features.indexOf(state.feature) >= 0) {
                    this.activeFeature = null;
                    this.activeLayer.remove(state.feature);
                } else if (state.coordinates && this.activeLayer.features.indexOf(state.feature) < 0) {
                    state.feature.coordinates = state.coordinates;
                    this.activeLayer.add(state.feature);
                    this.activeFeature = state.feature;
                } else if (state.coordinates) {
                    state.feature.coordinates = state.coordinates;
                    this.activeFeature = state.feature;
                }

                this._updateTransformControl();
                this.activeLayer.redraw();
            }
        }, {
            key: 'activeFeature',
            get: function get() {
                return this._activeFeature;
            },
            set: function set(feature) {
                if (feature) this.activate();
                this._select(feature);
            }
        }, {
            key: 'ignoreEvents',
            get: function get() {
                return this._ignoreEvents;
            },
            set: function set(bool) {
                this._ignoreEvents = bool;
                this._pointEditor.ignoreEvents = bool;
                this._polyEditor.ignoreEvents = bool;
                this._polyTransform.ignoreEvents = bool;
            }
        }, {
            key: 'pointEditor',
            get: function get() {
                return this._pointEditor;
            }
        }, {
            key: 'polyEditor',
            get: function get() {
                return this._polyEditor;
            }
        }, {
            key: 'polyTransform',
            get: function get() {
                return this._polyTransform;
            }
        }]);

        return Editor;
    }(Control);

    Editor.prototype._deselectAllowed = true;

    Editor.prototype.allowDeletion = true;

    return Editor;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('controls.MultiPoint', ['utils', 'Control', 'FeatureLayer', 'symbol.point.Point', 'feature.MultiPoint'], function (utils, Control, FeatureLayer, PointSymbol, MultiPointFeature) {

    'use strict';

    var MultiPoint = function (_Control) {
        _inherits(MultiPoint, _Control);

        function MultiPoint(map, properties) {
            _classCallCheck(this, MultiPoint);

            var _this = _possibleConstructorReturn(this, (MultiPoint.__proto__ || Object.getPrototypeOf(MultiPoint)).call(this, map, properties));

            _this._handleClick = _this._handleClick.bind(_this);
            _this._handleDblclick = _this._handleDblclick.bind(_this);
            return _this;
        }

        _createClass(MultiPoint, [{
            key: '_activate',
            value: function _activate() {
                this._tempLayer = new FeatureLayer();
                this.map.addLayer(this._tempLayer);

                this.map.on('click', this._handleClick);
            }
        }, {
            key: '_deactivate',
            value: function _deactivate() {
                this.cancelDrawing();
                this.map.removeLayer(this._tempLayer);
                this._tempLayer = null;
                this.map.off('click', this._handleClick);
            }
        }, {
            key: '_handleClick',
            value: function _handleClick(sGisEvent) {
                var _this2 = this;

                setTimeout(function () {
                    if (Date.now() - _this2._dblClickTime < _this2.dblClickTimeout) return;
                    if (_this2._activeFeature) {
                        _this2._activeFeature.addPoint(sGisEvent.point);
                    } else {
                        _this2.startNewFeature(sGisEvent.point);
                        _this2.fire('drawingBegin');
                    }
                    _this2.fire('pointAdd');

                    _this2._tempLayer.redraw();
                }, 10);

                sGisEvent.stopPropagation();
            }
        }, {
            key: 'startNewFeature',
            value: function startNewFeature(point) {
                this.activate();
                this.cancelDrawing();

                this._activeFeature = new MultiPointFeature([point.position], { crs: this.map.crs, symbol: this.symbol });
                this._tempLayer.add(this._activeFeature);

                this._setHandlers();
            }
        }, {
            key: '_setHandlers',
            value: function _setHandlers() {
                this.map.addListener('dblclick', this._handleDblclick);
            }
        }, {
            key: 'cancelDrawing',
            value: function cancelDrawing() {
                if (!this._activeFeature) return;

                this.map.removeListener('dblclick', this._handleDblclick);

                if (this._tempLayer.has(this._activeFeature)) this._tempLayer.remove(this._activeFeature);
                this._activeFeature = null;
            }
        }, {
            key: '_handleDblclick',
            value: function _handleDblclick(sGisEvent) {
                var feature = this._activeFeature;
                this.finishDrawing(self, sGisEvent);
                sGisEvent.stopPropagation();
                this._dblClickTime = Date.now();
                this.fire('drawingFinish', { feature: feature, browserEvent: sGisEvent.browserEvent });
            }
        }, {
            key: 'finishDrawing',
            value: function finishDrawing() {
                var feature = this._activeFeature;
                this.cancelDrawing();
                if (this.activeLayer) this.activeLayer.add(feature);
            }
        }, {
            key: 'activeFeature',
            get: function get() {
                return this._activeFeature;
            },
            set: function set(feature) {
                if (!this._isActive) return;
                this.cancelDrawing();

                this._activeFeature = feature;
                this._setHandlers();
            }
        }]);

        return MultiPoint;
    }(Control);

    MultiPoint.prototype.dblClickTimeout = 30;
    MultiPoint.prototype.symbol = new PointSymbol();

    return MultiPoint;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('controls.Point', ['Control', 'feature.Point', 'symbol.point.Point'], function (Control, PointFeature, PointSymbol) {
    'use strict';

    var PointControl = function (_Control) {
        _inherits(PointControl, _Control);

        function PointControl(map, properties) {
            _classCallCheck(this, PointControl);

            var _this = _possibleConstructorReturn(this, (PointControl.__proto__ || Object.getPrototypeOf(PointControl)).call(this, map, properties));

            _this._handleClick = _this._handleClick.bind(_this);
            return _this;
        }

        _createClass(PointControl, [{
            key: '_activate',
            value: function _activate() {
                this.map.addListener('click', this._handleClick);
            }
        }, {
            key: '_deactivate',
            value: function _deactivate() {
                this.map.removeListener('click', this._handleClick);
            }
        }, {
            key: '_handleClick',
            value: function _handleClick(sGisEvent) {
                sGisEvent.stopPropagation();

                var point = sGisEvent.point.projectTo(this.map.crs);
                var feature = new PointFeature(point.position, { crs: this.map.crs, symbol: this.symbol });

                if (this.activeLayer) this.activeLayer.add(feature);
                this.fire('drawingFinish', { feature: feature });
            }
        }]);

        return PointControl;
    }(Control);

    PointControl.prototype.symbol = new PointSymbol();

    return PointControl;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('controls.PointEditor', ['Control', 'controls.Snapping'], function (Control, Snapping) {

    'use strict';

    var PointEditor = function (_Control) {
        _inherits(PointEditor, _Control);

        function PointEditor(map, options) {
            _classCallCheck(this, PointEditor);

            var _this = _possibleConstructorReturn(this, (PointEditor.__proto__ || Object.getPrototypeOf(PointEditor)).call(this, map, options));

            _this._handleDragStart = _this._handleDragStart.bind(_this);
            _this._handleDrag = _this._handleDrag.bind(_this);
            _this._handleDragEnd = _this._handleDragEnd.bind(_this);

            _this._snapping = new Snapping(map);
            return _this;
        }

        _createClass(PointEditor, [{
            key: '_activate',
            value: function _activate() {
                if (!this._activeFeature) return;

                if (this.snappingTypes && this.snappingTypes.length > 0) {
                    this._snapping.snappingTypes = this.snappingTypes;
                    this._snapping.activeLayer = this.activeLayer;
                    this._snapping.activeFeature = this._activeFeature;
                }

                this._activeFeature.on('dragStart', this._handleDragStart);
                this._activeFeature.on('drag', this._handleDrag);
                this._activeFeature.on('dragEnd', this._handleDragEnd);
            }
        }, {
            key: '_deactivate',
            value: function _deactivate() {
                if (!this._activeFeature) return;

                this._snapping.deactivate();

                this._activeFeature.off('dragStart', this._handleDragStart);
                this._activeFeature.off('drag', this._handleDrag);
                this._activeFeature.off('dragEnd', this._handleDragEnd);
            }
        }, {
            key: '_handleDragStart',
            value: function _handleDragStart(sGisEvent) {
                if (this.ignoreEvents) return;

                sGisEvent.draggingObject = this._activeFeature;
                sGisEvent.stopPropagation();

                this._snapping.activate();
            }
        }, {
            key: '_handleDrag',
            value: function _handleDrag(sGisEvent) {
                this._activeFeature.position = this._snapping.position || sGisEvent.point.projectTo(this._activeFeature.crs).position;
                if (this.activeLayer) this.activeLayer.redraw();
            }
        }, {
            key: '_handleDragEnd',
            value: function _handleDragEnd() {
                this._snapping.deactivate();
                this.fire('edit');
            }
        }, {
            key: 'activeFeature',
            get: function get() {
                return this._activeFeature;
            },
            set: function set(feature) {
                this.deactivate();

                this._activeFeature = feature;
                if (feature) this.activate();
            }
        }]);

        return PointEditor;
    }(Control);

    PointEditor.prototype.snappingTypes = ['vertex', 'midpoint', 'line'];
    PointEditor.prototype.ignoreEvents = false;

    return PointEditor;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('controls.Poly', ['utils', 'Control', 'FeatureLayer'], function (utils, Control, FeatureLayer) {
    'use strict';

    var PolyControl = function (_Control) {
        _inherits(PolyControl, _Control);

        function PolyControl(FeatureClass, symbol, map, properties) {
            _classCallCheck(this, PolyControl);

            var _this = _possibleConstructorReturn(this, (PolyControl.__proto__ || Object.getPrototypeOf(PolyControl)).call(this, map, properties));

            if (!_this.symbol) _this.symbol = symbol;
            _this._getNewFeature = function (rings, options) {
                return new FeatureClass(rings, options);
            };

            _this._handleClick = _this._handleClick.bind(_this);
            _this._handleMousemove = _this._handleMousemove.bind(_this);
            _this._handleDblclick = _this._handleDblclick.bind(_this);
            return _this;
        }

        _createClass(PolyControl, [{
            key: '_activate',
            value: function _activate() {
                this._tempLayer = new FeatureLayer();
                this.map.addLayer(this._tempLayer);
                this.map.on('click', this._handleClick);
            }
        }, {
            key: '_deactivate',
            value: function _deactivate() {
                this.cancelDrawing();
                this.map.removeLayer(this._tempLayer);
                this._tempLayer = null;
                this.map.off('click', this._handleClick);
            }
        }, {
            key: '_handleClick',
            value: function _handleClick(sGisEvent) {
                var _this2 = this;

                setTimeout(function () {
                    if (Date.now() - _this2._dblClickTime < 30) return;
                    if (_this2._activeFeature) {
                        if (sGisEvent.ctrlKey) {
                            _this2.startNewRing();
                        } else {
                            _this2._activeFeature.addPoint(sGisEvent.point, _this2._activeFeature.rings.length - 1);
                        }
                    } else {
                        _this2.startNewFeature(sGisEvent.point);
                        _this2.fire('drawingBegin');
                    }
                    _this2.fire('pointAdd');

                    _this2._tempLayer.redraw();
                }, 10);

                sGisEvent.stopPropagation();
            }
        }, {
            key: 'startNewFeature',
            value: function startNewFeature(point) {
                this.activate();
                this.cancelDrawing();

                this._activeFeature = this._getNewFeature([point.position, point.position], { crs: this.map.crs, symbol: this.symbol });
                this._tempLayer.add(this._activeFeature);

                this._setHandlers();
            }
        }, {
            key: '_setHandlers',
            value: function _setHandlers() {
                this.map.addListener('mousemove', this._handleMousemove);
                this.map.addListener('dblclick', this._handleDblclick);
            }
        }, {
            key: '_handleMousemove',
            value: function _handleMousemove(sGisEvent) {
                var ringIndex = this._activeFeature.rings.length - 1;
                var pointIndex = this._activeFeature.rings[ringIndex].length - 1;

                this._activeFeature.rings[ringIndex][pointIndex] = sGisEvent.point.position;
                this._activeFeature.redraw();
                this._tempLayer.redraw();

                this.fire('mousemove');
            }
        }, {
            key: '_handleDblclick',
            value: function _handleDblclick(sGisEvent) {
                var feature = this._activeFeature;
                this.finishDrawing(self, sGisEvent);
                sGisEvent.stopPropagation();
                this._dblClickTime = Date.now();
                this.fire('drawingFinish', { feature: feature, browserEvent: sGisEvent.browserEvent });
            }
        }, {
            key: 'cancelDrawing',
            value: function cancelDrawing() {
                if (!this._activeFeature) return;

                this.map.removeListener('mousemove', this._handleMousemove);
                this.map.removeListener('dblclick', this._handleDblclick);

                if (this._tempLayer.has(this._activeFeature)) this._tempLayer.remove(this._activeFeature);
                this._activeFeature = null;
            }
        }, {
            key: 'finishDrawing',
            value: function finishDrawing() {
                var feature = this._activeFeature;
                var ringIndex = feature.rings.length - 1;

                this.cancelDrawing();
                if (ringIndex === 0 && feature.rings[ringIndex].length < 3) return;

                feature.removePoint(ringIndex, feature.rings[ringIndex].length - 1);

                if (this.activeLayer) this.activeLayer.add(feature);
            }
        }, {
            key: 'startNewRing',
            value: function startNewRing() {
                var rings = this._activeFeature.rings;
                var ringIndex = rings.length;
                var point = rings[ringIndex - 1][rings[ringIndex - 1].length - 1];
                this._activeFeature.setRing(ringIndex, [point]);
            }
        }, {
            key: 'activeFeature',
            get: function get() {
                return this._activeFeature;
            },
            set: function set(feature) {
                if (!this._isActive) return;
                this.cancelDrawing();

                this._activeFeature = feature;
                this._setHandlers();
            }
        }]);

        return PolyControl;
    }(Control);

    return PolyControl;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('controls.PolyDrag', ['Control', 'FeatureLayer', 'symbol.polygon.Simple'], function (Control, FeatureLayer, PolygonSymbol) {

    'use strict';

    var PolyDrag = function (_Control) {
        _inherits(PolyDrag, _Control);

        function PolyDrag(map, properties) {
            _classCallCheck(this, PolyDrag);

            var _this = _possibleConstructorReturn(this, (PolyDrag.__proto__ || Object.getPrototypeOf(PolyDrag)).call(this, map, properties));

            if (!_this.symbol) _this.symbol = new PolygonSymbol();

            _this._handleDragStart = _this._handleDragStart.bind(_this);
            _this._handleDrag = _this._handleDrag.bind(_this);
            _this._handleDragEnd = _this._handleDragEnd.bind(_this);
            return _this;
        }

        _createClass(PolyDrag, [{
            key: '_activate',
            value: function _activate() {
                this.map.on('dragStart', this._handleDragStart);
                this._tempLayer = new FeatureLayer();
                this.map.addLayer(this._tempLayer);
            }
        }, {
            key: '_deactivate',
            value: function _deactivate() {
                this.map.removeLayer(this._tempLayer);
                this._tempLayer = null;
                this._activeFeature = null;
                this._removeDragListeners();
                this.map.off('dragStart', this._handleDragStart);
            }
        }, {
            key: '_handleDragStart',
            value: function _handleDragStart(sGisEvent) {
                this._startNewFeature(sGisEvent.point);
                this.map.on('drag', this._handleDrag);
                this.map.on('dragEnd', this._handleDragEnd);

                this.fire('drawingBegin');
            }
        }, {
            key: '_handleDrag',
            value: function _handleDrag(sGisEvent) {
                this._updateFeature(sGisEvent.point);
                this._tempLayer.redraw();
                sGisEvent.stopPropagation();
            }
        }, {
            key: '_handleDragEnd',
            value: function _handleDragEnd(sGisEvent) {
                var feature = this._activeFeature;
                this._activeFeature = null;
                this._tempLayer.features = [];
                this._removeDragListeners();

                if (this.activeLayer) this.activeLayer.add(feature);
                this.fire('drawingFinish', { feature: feature, browserEvent: sGisEvent.browserEvent });
            }
        }, {
            key: '_removeDragListeners',
            value: function _removeDragListeners() {
                this.map.off('drag', this._handleDrag);
                this.map.off('dragEnd', this._handleDragEnd);
            }
        }, {
            key: '_startNewFeature',
            value: function _startNewFeature(point) {}
        }, {
            key: '_updateFeature',
            value: function _updateFeature(point) {}
        }, {
            key: 'activeFeature',
            get: function get() {
                return this._activeFeature;
            }
        }, {
            key: 'tempLayer',
            get: function get() {
                return this._tempLayer;
            }
        }]);

        return PolyDrag;
    }(Control);

    return PolyDrag;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('controls.PolyEditor', ['Control', 'controls.Snapping', 'geotools', 'symbol.point.Point', 'FeatureLayer', 'feature.Point'], function (Control, Snapping, geotools, PointSymbol, FeatureLayer, Point) {

    'use strict';

    var PolyEditor = function (_Control) {
        _inherits(PolyEditor, _Control);

        function PolyEditor(map, options) {
            _classCallCheck(this, PolyEditor);

            var _this = _possibleConstructorReturn(this, (PolyEditor.__proto__ || Object.getPrototypeOf(PolyEditor)).call(this, map, options));

            _this._snapping = new Snapping(map);

            _this._handleMousemove = _this._handleMousemove.bind(_this);
            _this._handleDragStart = _this._handleDragStart.bind(_this);
            _this._handleDrag = _this._handleDrag.bind(_this);
            _this._handleDragEnd = _this._handleDragEnd.bind(_this);
            _this._handleDblClick = _this._handleDblClick.bind(_this);
            return _this;
        }

        _createClass(PolyEditor, [{
            key: '_activate',
            value: function _activate() {
                if (!this._activeFeature) return;
                this._setTempLayer();

                this._activeFeature.on('mousemove mouseout', this._handleMousemove);
                this._activeFeature.on('dragStart', this._handleDragStart);
                this._activeFeature.on('drag', this._handleDrag);
                this._activeFeature.on('dragEnd', this._handleDragEnd);
                this._activeFeature.on('dblclick', this._handleDblClick);
            }
        }, {
            key: '_deactivate',
            value: function _deactivate() {
                if (!this._activeFeature) return;
                this._removeTempLayer();

                this._activeFeature.off('mousemove mouseout', this._handleMousemove);
                this._activeFeature.off('dragStart', this._handleDragStart);
                this._activeFeature.off('drag', this._handleDrag);
                this._activeFeature.off('dragEnd', this._handleDragEnd);
                this._activeFeature.off('dblclick', this._handleDblClick);
            }
        }, {
            key: '_setTempLayer',
            value: function _setTempLayer() {
                this._tempLayer = new FeatureLayer();
                this.map.addLayer(this._tempLayer);
            }
        }, {
            key: '_removeTempLayer',
            value: function _removeTempLayer() {
                if (!this._tempLayer) return;
                this.map.removeLayer(this._tempLayer);
                this._tempLayer = null;
            }
        }, {
            key: '_handleMousemove',
            value: function _handleMousemove(sGisEvent) {
                if (this.ignoreEvents || !this.vertexChangeAllowed || this._activeRing !== null || this._activeIndex !== null || sGisEvent.eventType === 'mouseout') {
                    this._tempLayer.features = [];
                }

                var intersection = sGisEvent.intersectionType;
                if (!Array.isArray(intersection)) return;

                var activeRing = intersection[0];
                var activeIndex = intersection[1];

                var ring = this._activeFeature.rings[activeRing];
                var point = ring[activeIndex];
                var evPoint = sGisEvent.point.projectTo(this._activeFeature.crs).position;

                var symbol = this.vertexHoverSymbol;

                var targetDist = this.vertexSize * this.map.resolution;
                var currDist = distance(point, evPoint);
                if (currDist > targetDist) {
                    var nextIndex = (activeIndex + 1) % ring.length;
                    point = ring[nextIndex];
                    var nextDist = distance(point, evPoint);
                    if (nextDist > targetDist) {
                        symbol = this.sideHoverSymbol;
                        point = geotools.pointToLineProjection(evPoint, [ring[activeIndex], point]);
                    }
                }

                var feature = new Point(point, { crs: this.map.crs, symbol: symbol });
                this._tempLayer.features = [feature];
            }
        }, {
            key: '_handleDragStart',
            value: function _handleDragStart(sGisEvent) {
                if (this.ignoreEvents || !this.vertexChangeAllowed && !this.featureDragAllowed) return;

                var intersection = sGisEvent.intersectionType;
                if (Array.isArray(intersection) && this.vertexChangeAllowed) {
                    var ring = this._activeFeature.rings[intersection[0]];
                    var point = ring[intersection[1]];
                    var evPoint = sGisEvent.point.projectTo(this._activeFeature.crs).position;

                    this._activeRing = intersection[0];

                    var targetDist = this.vertexSize * this.map.resolution;
                    var currDist = distance(point, evPoint);
                    if (currDist < targetDist) {
                        this._activeIndex = intersection[1];
                    } else {
                        var nextIndex = (intersection[1] + 1) % ring.length;
                        point = ring[nextIndex];
                        var nextDist = distance(point, evPoint);
                        if (nextDist < targetDist) {
                            this._activeIndex = nextIndex;
                        } else {
                            this._activeFeature.insertPoint(intersection[0], intersection[1] + 1, evPoint);
                            this._activeIndex = intersection[1] + 1;
                        }
                    }
                } else {
                    this._activeRing = this._activeIndex = null;
                }

                if (this._activeRing !== null || this.featureDragAllowed) {
                    sGisEvent.draggingObject = this._activeFeature;
                    sGisEvent.stopPropagation();
                }

                this._setSnapping();
            }
        }, {
            key: '_setSnapping',
            value: function _setSnapping() {
                if (this._activeRing === null || !this.snappingTypes) return;

                this._snapping.activeLayer = this.activeLayer;
                this._snapping.snappingTypes = this.snappingTypes;
                this._snapping.activeFeature = this._activeFeature;
                this._snapping.activeRingIndex = this._activeRing;
                this._snapping.activePointIndex = this._activeIndex;

                this._snapping.activate();
            }
        }, {
            key: '_handleDrag',
            value: function _handleDrag(sGisEvent) {
                if (this._activeRing === null) return this._handleFeatureDrag(sGisEvent);

                this._activeFeature.setPoint(this._activeRing, this._activeIndex, this._snapping.position || sGisEvent.point.projectTo(this._activeFeature.crs).position);
                this._activeFeature.redraw();
                if (this.activeLayer) this.activeLayer.redraw();
                this.fire('change', { ringIndex: this._activeRing, pointIndex: this._activeIndex });
            }
        }, {
            key: '_handleDragEnd',
            value: function _handleDragEnd() {
                this._snapping.deactivate();
                this._activeRing = null;
                this._activeIndex = null;

                this.fire('edit');
            }
        }, {
            key: '_handleFeatureDrag',
            value: function _handleFeatureDrag(sGisEvent) {
                geotools.move([this._activeFeature], [-sGisEvent.offset.x, -sGisEvent.offset.y]);
                this._activeFeature.redraw();
                if (this.activeLayer) this.activeLayer.redraw();

                this.fire('change');
            }
        }, {
            key: '_handleDblClick',
            value: function _handleDblClick(sGisEvent) {
                if (this.ignoreEvents || !Array.isArray(sGisEvent.intersectionType)) return;

                var ringIndex = sGisEvent.intersectionType[0];
                var ring = this._activeFeature.rings[ringIndex];

                var index = sGisEvent.intersectionType[1];
                var evPoint = sGisEvent.point.projectTo(this._activeFeature.crs).position;
                var d1 = distance(evPoint, ring[index]);

                var nextIndex = (index + 1) % ring.length;
                var d2 = distance(evPoint, ring[nextIndex]);

                if (d2 < d1) index = nextIndex;

                if (ring.length > 2) {
                    this._activeFeature.removePoint(ringIndex, index);
                    this.fire('edit', { ringIndex: ringIndex, pointIndex: index });
                } else if (this._activeFeature.rings.length > 1) {
                    this._activeFeature.removeRing(ringIndex);
                    this.fire('edit', { ringIndex: ringIndex, pointIndex: index });
                } else if (this.onFeatureRemove) {
                    this.onFeatureRemove();
                }

                if (this.activeLayer) this.activeLayer.redraw();
                sGisEvent.stopPropagation();
            }
        }, {
            key: 'activeFeature',
            get: function get() {
                return this._activeFeature;
            },
            set: function set(feature) {
                this.deactivate();
                this._activeFeature = feature;
                this.activate();
            }
        }]);

        return PolyEditor;
    }(Control);

    PolyEditor.prototype.vertexSize = 7;

    PolyEditor.prototype.onFeatureRemove = null;

    PolyEditor.prototype.snappingTypes = ['vertex', 'midpoint', 'line', 'axis', 'orthogonal'];

    PolyEditor.prototype.vertexChangeAllowed = true;

    PolyEditor.prototype.featureDragAllowed = true;

    PolyEditor.prototype.ignoreEvents = false;

    PolyEditor.prototype.vertexHoverSymbol = new PointSymbol({ size: 7 });

    PolyEditor.prototype.sideHoverSymbol = new PointSymbol({});

    function distance(p1, p2) {
        return Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]));
    }

    return PolyEditor;
});
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('controls.Polygon', ['controls.Poly', 'feature.Polygon', 'symbol.polygon.Simple'], function (Poly, Polygon, PolygonSymbol) {

    'use strict';

    var PolygonControl = function (_Poly) {
        _inherits(PolygonControl, _Poly);

        function PolygonControl(map, properties) {
            _classCallCheck(this, PolygonControl);

            return _possibleConstructorReturn(this, (PolygonControl.__proto__ || Object.getPrototypeOf(PolygonControl)).call(this, Polygon, new PolygonSymbol(), map, properties));
        }

        return PolygonControl;
    }(Poly);

    return PolygonControl;
});
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('controls.Polyline', ['controls.Poly', 'feature.Polyline', 'symbol.polyline.Simple'], function (Poly, Polyline, PolylineSymbol) {

    'use strict';

    var PolylineControl = function (_Poly) {
        _inherits(PolylineControl, _Poly);

        function PolylineControl(map, properties) {
            _classCallCheck(this, PolylineControl);

            return _possibleConstructorReturn(this, (PolylineControl.__proto__ || Object.getPrototypeOf(PolylineControl)).call(this, Polyline, new PolylineSymbol(), map, properties));
        }

        return PolylineControl;
    }(Poly);

    return PolylineControl;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('controls.PolyTransform', ['Control', 'FeatureLayer', 'feature.Point', 'symbol.point.Point', 'symbol.point.Square', 'geotools'], function (Control, FeatureLayer, PointFeature, PointSymbol, SquareSymbol, geotools) {

    'use strict';

    var PolyTransform = function (_Control) {
        _inherits(PolyTransform, _Control);

        function PolyTransform(map, options) {
            _classCallCheck(this, PolyTransform);

            var _this = _possibleConstructorReturn(this, (PolyTransform.__proto__ || Object.getPrototypeOf(PolyTransform)).call(this, map, options));

            _this._handleRotationStart = _this._handleRotationStart.bind(_this);
            _this._handleRotation = _this._handleRotation.bind(_this);
            _this._handleRotationEnd = _this._handleRotationEnd.bind(_this);

            _this._handleScalingEnd = _this._handleScalingEnd.bind(_this);
            return _this;
        }

        _createClass(PolyTransform, [{
            key: 'update',
            value: function update() {
                if (this._activeFeature) this._updateHandles();
            }
        }, {
            key: '_activate',
            value: function _activate() {
                if (!this._activeFeature) return;

                this._tempLayer = new FeatureLayer();
                this._setHandles();
                this.map.addLayer(this._tempLayer);
            }
        }, {
            key: '_deactivate',
            value: function _deactivate() {
                if (!this._activeFeature) return;
                this.map.removeLayer(this._tempLayer);
                this._tempLayer = null;
            }
        }, {
            key: '_setHandles',
            value: function _setHandles() {
                if (this.enableRotation) this._setRotationHandle();
                if (this.enableScaling) this._setScaleHandles();
            }
        }, {
            key: '_setRotationHandle',
            value: function _setRotationHandle() {
                this._rotationHandle = new PointFeature([0, 0], { crs: this._activeFeature.crs, symbol: this.rotationHandleSymbol });
                this._updateRotationHandle();
                this._rotationHandle.on('dragStart', this._handleRotationStart);
                this._rotationHandle.on('drag', this._handleRotation);
                this._rotationHandle.on('dragEnd', this._handleRotationEnd);
                this._tempLayer.add(this._rotationHandle);
            }
        }, {
            key: '_setScaleHandles',
            value: function _setScaleHandles() {
                this._scaleHandles = [];
                for (var i = 0; i < 9; i++) {
                    if (i === 4) continue;

                    var symbol = this.scaleHandleSymbol.clone();
                    var xk = i % 3 - 1;
                    var yk = 1 - Math.floor(i / 3);
                    symbol.offset = { x: this.scaleHandleOffset * xk, y: this.scaleHandleOffset * yk };

                    this._scaleHandles[i] = new PointFeature([0, 0], { symbol: symbol, crs: this._activeFeature.crs });
                    this._scaleHandles[i].on('dragStart', this._handleScalingStart.bind(this, i));
                    this._scaleHandles[i].on('drag', this._handleScaling.bind(this, i));
                    this._scaleHandles[i].on('dragEnd', this._handleScalingEnd);
                }

                this._tempLayer.add(this._scaleHandles);
                this._updateScaleHandles();
            }
        }, {
            key: '_handleRotationStart',
            value: function _handleRotationStart(sGisEvent) {
                if (this.ignoreEvents) return;

                this._rotationBase = this._activeFeature.bbox.center.position;
                sGisEvent.draggingObject = this._rotationHandle;
                sGisEvent.stopPropagation();

                this.fire('rotationStart');
            }
        }, {
            key: '_handleRotation',
            value: function _handleRotation(sGisEvent) {
                var xPrev = sGisEvent.point.x + sGisEvent.offset.x;
                var yPrev = sGisEvent.point.y + sGisEvent.offset.y;

                var alpha1 = xPrev === this._rotationBase[0] ? Math.PI / 2 : Math.atan2(yPrev - this._rotationBase[1], xPrev - this._rotationBase[0]);
                var alpha2 = sGisEvent.point.x === this._rotationBase[0] ? Math.PI / 2 : Math.atan2(sGisEvent.point.y - this._rotationBase[1], sGisEvent.point.x - this._rotationBase[0]);
                var angle = alpha2 - alpha1;

                geotools.rotate(this._activeFeature, angle, this._rotationBase);
                if (this.activeLayer) this.activeLayer.redraw();
                this._updateHandles();
            }
        }, {
            key: '_handleRotationEnd',
            value: function _handleRotationEnd() {
                this.fire('rotationEnd');
            }
        }, {
            key: '_updateHandles',
            value: function _updateHandles() {
                if (this.enableRotation) this._updateRotationHandle();
                if (this.enableScaling) this._updateScaleHandles();

                this._tempLayer.redraw();
            }
        }, {
            key: '_updateRotationHandle',
            value: function _updateRotationHandle() {
                var bbox = this._activeFeature.bbox;
                this._rotationHandle.position = [(bbox.xMin + bbox.xMax) / 2, bbox.yMax];
            }
        }, {
            key: '_updateScaleHandles',
            value: function _updateScaleHandles() {
                var bbox = this._activeFeature.bbox;
                var xs = [bbox.xMin, (bbox.xMin + bbox.xMax) / 2, bbox.xMax];
                var ys = [bbox.yMin, (bbox.yMin + bbox.yMax) / 2, bbox.yMax];

                for (var i = 0; i < 9; i++) {
                    if (i === 4) continue;
                    this._scaleHandles[i].position = [xs[i % 3], ys[Math.floor(i / 3)]];
                }
            }
        }, {
            key: '_handleScalingStart',
            value: function _handleScalingStart(index, sGisEvent) {
                if (this.ignoreEvents) return;

                sGisEvent.draggingObject = this._scaleHandles[index];
                sGisEvent.stopPropagation();

                this.fire('scalingStart');
            }
        }, {
            key: '_handleScaling',
            value: function _handleScaling(index, sGisEvent) {
                var MIN_SIZE = 10;
                var xIndex = index % 3;
                var yIndex = Math.floor(index / 3);

                var baseX = xIndex === 0 ? 2 : xIndex === 2 ? 0 : 1;
                var baseY = yIndex === 0 ? 2 : yIndex === 2 ? 0 : 1;
                var basePoint = this._scaleHandles[baseX + 3 * baseY].position;

                var bbox = this._activeFeature.bbox;
                var resolution = this.map.resolution;
                var tolerance = MIN_SIZE * resolution;
                var width = bbox.width;
                var xScale = baseX === 1 ? 1 : (width + (baseX - 1) * sGisEvent.offset.x) / width;
                if (width < tolerance && xScale < 1) xScale = 1;
                var height = bbox.height;
                var yScale = baseY === 1 ? 1 : (height + (baseY - 1) * sGisEvent.offset.y) / height;
                if (height < tolerance && yScale < 1) yScale = 1;

                geotools.scale(this._activeFeature, [xScale, yScale], basePoint);
                if (this.activeLayer) this.activeLayer.redraw();
                this._updateHandles();
            }
        }, {
            key: '_handleScalingEnd',
            value: function _handleScalingEnd() {
                this.fire('scalingEnd');
            }
        }, {
            key: 'activeFeature',
            get: function get() {
                return this._activeFeature;
            },
            set: function set(feature) {
                this.deactivate();
                this._activeFeature = feature;
                this.activate();
            }
        }]);

        return PolyTransform;
    }(Control);

    PolyTransform.prototype.rotationHandleSymbol = new PointSymbol({ offset: { x: 0, y: -30 } });

    PolyTransform.prototype.scaleHandleSymbol = new SquareSymbol({ fillColor: 'transparent', strokeColor: 'black', strokeWidth: 2, size: 7 });

    PolyTransform.prototype.scaleHandleOffset = 12;

    PolyTransform.prototype.enableRotation = true;

    PolyTransform.prototype.enableScaling = true;

    PolyTransform.prototype.ignoreEvents = false;

    return PolyTransform;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('controls.Rectangle', ['controls.PolyDrag', 'feature.Polygon'], function (PolyDrag, Polygon) {

    'use strict';

    var Rectangle = function (_PolyDrag) {
        _inherits(Rectangle, _PolyDrag);

        function Rectangle() {
            _classCallCheck(this, Rectangle);

            return _possibleConstructorReturn(this, (Rectangle.__proto__ || Object.getPrototypeOf(Rectangle)).apply(this, arguments));
        }

        _createClass(Rectangle, [{
            key: '_startNewFeature',
            value: function _startNewFeature(point) {
                var position = point.position;
                this._activeFeature = new Polygon([[position, position, position, position]], { crs: point.crs, symbol: this.symbol });
                this.tempLayer.add(this._activeFeature);
            }
        }, {
            key: '_updateFeature',
            value: function _updateFeature(point) {
                var coord = this._activeFeature.rings[0];
                var pointCoord = point.position;

                coord = [[coord[0], [coord[1][0], pointCoord[1]], pointCoord, [pointCoord[0], coord[3][1]]]];

                this._activeFeature.rings = coord;
            }
        }]);

        return Rectangle;
    }(PolyDrag);

    return Rectangle;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('controls.Snapping', ['Control', 'FeatureLayer', 'feature.Point', 'symbol.point.Point', 'Bbox', 'geotools'], function (Control, FeatureLayer, PointFeature, PointSymbol, Bbox, geotools) {

    'use strict';

    var Snapping = function (_Control) {
        _inherits(Snapping, _Control);

        function Snapping(map, options) {
            _classCallCheck(this, Snapping);

            var _this = _possibleConstructorReturn(this, (Snapping.__proto__ || Object.getPrototypeOf(Snapping)).call(this, map, options));

            _this._onMouseMove = _this._onMouseMove.bind(_this);
            return _this;
        }

        _createClass(Snapping, [{
            key: '_activate',
            value: function _activate() {
                this._tempLayer = new FeatureLayer();
                this.map.addLayer(this._tempLayer);
                this._setListeners();
            }
        }, {
            key: '_setListeners',
            value: function _setListeners() {
                this.map.on('mousemove', this._onMouseMove);
            }
        }, {
            key: '_deactivate',
            value: function _deactivate() {
                this._removeListeners();
                this.map.removeLayer(this._tempLayer);
                this._tempLayer = null;
                this._snapping = null;
            }
        }, {
            key: '_removeListeners',
            value: function _removeListeners() {
                this.map.off('mousemove', this._onMouseMove);
            }
        }, {
            key: '_onMouseMove',
            value: function _onMouseMove(sGisEvent) {
                var point = sGisEvent.point;
                var snapping = this.getSnapping(point);

                this._tempLayer.features = snapping ? [new PointFeature(snapping.position, { crs: point.crs, symbol: this.symbol })] : [];

                this._snapping = snapping;
            }
        }, {
            key: 'getSnapping',
            value: function getSnapping(point) {
                var distance = this.map.resolution * this.snappingDistance;
                for (var i = 0; i < this.snappingTypes.length; i++) {
                    var snappingResult = snapping[this.snappingTypes[i]](point, this.activeLayer, distance, this.activeFeature, this.activeRingIndex, this.activePointIndex);
                    if (snappingResult) return snappingResult;
                }
                return null;
            }
        }, {
            key: 'position',
            get: function get() {
                return this._snapping && this._snapping.position;
            }
        }]);

        return Snapping;
    }(Control);

    Snapping.prototype.snappingTypes = ['vertex', 'midpoint', 'line', 'axis', 'orthogonal'];

    Snapping.prototype.symbol = new PointSymbol({ fillColor: 'red', size: 5 });

    Snapping.prototype.snappingDistance = 7;

    Snapping.prototype.activeFeature = null;

    Snapping.prototype.activeRingIndex = null;

    Snapping.prototype.activePointIndex = null;

    var snapping = {
        vertex: function vertex(point, layer, distance, activeFeature, activeRing, activeIndex) {
            var bbox = new Bbox([point.x - distance, point.y - distance], [point.x + distance, point.y + distance], point.crs);
            var features = layer.getFeatures(bbox);

            for (var i = 0; i < features.length; i++) {
                var feature = features[i].crs.equals(point.crs) ? features[i] : features[i].projectTo(point.crs);

                if (feature.position) {
                    if (features[i] === activeFeature) continue;
                    if (Math.abs(feature.x - point.x) < distance && Math.abs(feature.y - point.y) < distance) {
                        return { position: feature.position, feature: features[i] };
                    }
                } else if (feature.rings) {
                    var rings = feature.rings;
                    for (var ring = 0; ring < rings.length; ring++) {
                        for (var j = 0; j < rings[ring].length; j++) {
                            if (features[i] === activeFeature && ring === activeRing && (Math.abs(j - activeIndex) < 2 || Math.abs(j - activeIndex) === rings[ring].length - 1)) continue;

                            if (Math.abs(rings[ring][j][0] - point.x) < distance && Math.abs(rings[ring][j][1] - point.y) < distance) {
                                return { position: rings[ring][j], feature: features[i], ring: ring, index: j };
                            }
                        }
                    }
                }
            }
        },

        midpoint: function midpoint(point, layer, distance, activeFeature, activeRing, activeIndex) {
            var bbox = new Bbox([point.x - distance, point.y - distance], [point.x + distance, point.y + distance], point.crs);
            var features = layer.getFeatures(bbox);

            for (var i = 0; i < features.length; i++) {
                if (!features[i].rings) continue;
                var feature = features[i].crs.equals(point.crs) ? features[i] : features[i].projectTo(point.crs);
                var rings = feature.rings;

                for (var ringIndex = 0; ringIndex < rings.length; ringIndex++) {
                    var ring = feature.isEnclosed ? rings[ringIndex].concat([rings[ringIndex][0]]) : rings[ringIndex];

                    for (var j = 1; j < ring.length; j++) {
                        if (features[i] === activeFeature && ringIndex === activeRing && (j === activeIndex || j - 1 === activeIndex || activeIndex === 0 && j === ring.length - 1)) continue;

                        var midPointX = (ring[j][0] + ring[j - 1][0]) / 2;
                        var midPointY = (ring[j][1] + ring[j - 1][1]) / 2;

                        if (Math.abs(midPointX - point.x) < distance && Math.abs(midPointY - point.y) < distance) {
                            return { position: [midPointX, midPointY], feature: features[i], ring: ringIndex, index: j };
                        }
                    }
                }
            }
        },

        line: function line(point, layer, distance, activeFeature, activeRing, activeIndex) {
            var bbox = new Bbox([point.x - distance, point.y - distance], [point.x + distance, point.y + distance], point.crs);
            var features = layer.getFeatures(bbox);

            for (var i = 0; i < features.length; i++) {
                if (!features[i].rings) continue;

                var feature = features[i].crs.equals(point.crs) ? features[i] : features[i].projectTo(point.crs);
                var rings = feature.rings;

                for (var ringIndex = 0; ringIndex < rings.length; ringIndex++) {
                    var ring = feature.isEnclosed ? rings[ringIndex].concat([rings[ringIndex][0]]) : rings[ringIndex];

                    for (var j = 1; j < ring.length; j++) {
                        if (features[i] === activeFeature && ringIndex === activeRing && (j === activeIndex || j - 1 === activeIndex || activeIndex === 0 && j === ring.length - 1)) continue;

                        var projection = geotools.pointToLineProjection(point.position, [ring[j - 1], ring[j]]);

                        var minX = Math.min(ring[j - 1][0], ring[j][0]);
                        var maxX = Math.max(ring[j - 1][0], ring[j][0]);
                        if (projection[0] >= minX && projection[0] <= maxX && Math.abs(projection[0] - point.x) < distance && Math.abs(projection[1] - point.y) < distance) {
                            return { position: projection, feature: features[i], ring: ringIndex, index: j - 1 };
                        }
                    }
                }
            }
        },

        axis: function axis(point, layer, distance, activeFeature) {
            var activeRing = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
            var activeIndex = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;

            if (!activeFeature || activeRing === null || activeIndex === null) return null;

            var lines = [];
            var ring = activeFeature.rings[activeRing].slice();
            if (activeFeature.isEnclosed) ring.push(ring[0]);

            if (activeIndex < ring.length - 1) {
                lines.push([ring[activeIndex], ring[activeIndex + 1]]);
            }
            if (activeIndex === 0) {
                if (activeFeature.isEnclosed) lines.push([ring[activeIndex], ring[ring.length - 2]]);
            } else {
                lines.push([ring[activeIndex], ring[activeIndex - 1]]);
            }

            var basePoint = [];
            for (var i = 0; i < lines.length; i++) {
                for (var axis = 0; axis < 2; axis++) {
                    var projection = [lines[i][axis][0], lines[i][(axis + 1) % 2][1]];
                    if (Math.abs(projection[0] - point.x) < distance && Math.abs(projection[1] - point.y) < distance) {
                        basePoint[(axis + 1) % 2] = lines[i][1][(axis + 1) % 2];
                        break;
                    }
                }
            }

            if (basePoint.length > 0) {
                var position = [basePoint[0] === undefined ? point.x : basePoint[0], basePoint[1] === undefined ? point.y : basePoint[1]];
                return { position: position, feature: activeFeature, ring: activeRing, index: activeIndex };
            }
        },

        orthogonal: function orthogonal(point, layer, distance, activeFeature) {
            var activeRing = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
            var activeIndex = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;

            if (!activeFeature || activeRing === null || activeIndex === null) return null;

            var lines = [];
            var ring = activeFeature.rings[activeRing].slice();
            if (activeFeature.isEnclosed) {
                var n = ring.length;
                lines.push([ring[(activeIndex + 1) % n], ring[(activeIndex + 2) % n]]);
                lines.push([ring[(n + activeIndex - 1) % n], ring[(n + activeIndex - 2) % n]]);
            } else {
                if (ring[activeIndex + 2]) {
                    lines.push([ring[activeIndex + 1], ring[activeIndex + 2]]);
                }
                if (ring[activeIndex - 2]) {
                    lines.push([ring[activeIndex - 1], ring[activeIndex - 2]]);
                }
            }

            for (var i = 0; i < lines.length; i++) {
                var projection = geotools.pointToLineProjection(point.position, lines[i]);
                var dx = projection[0] - lines[i][0][0];
                var dy = projection[1] - lines[i][0][1];
                if (Math.abs(dx) < distance && Math.abs(dy) < distance) {
                    var basePoint = [point.x - dx, point.y - dy];
                    var direction = i === 0 ? 1 : -1;
                    var nextPoint = n ? ring[(n + activeIndex + direction) % n] : ring[activeIndex + direction];
                    var prevPoint = n ? ring[(n + activeIndex - direction) % n] : ring[activeIndex - direction];
                    if (nextPoint && prevPoint) {
                        projection = geotools.pointToLineProjection(prevPoint, [ring[activeIndex], nextPoint]);
                        if (Math.abs(projection[0] - point.x) < distance && Math.abs(projection[1] - point.y) < distance) {
                            basePoint = projection;
                        }
                    }
                    return { position: basePoint, feature: activeFeature, ring: activeRing, index: activeIndex };
                }
            }
        }
    };

    return Snapping;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('Feature', ['utils', 'CRS', 'Bbox', 'EventHandler'], function (utils, CRS, Bbox, EventHandler) {

    'use strict';

    var defaults = {
        _crs: CRS.geo,
        _symbol: null,
        _hidden: false
    };

    var Feature = function (_EventHandler) {
        _inherits(Feature, _EventHandler);

        _createClass(Feature, null, [{
            key: 'setDefaultCrs',
            value: function setDefaultCrs(crs) {
                Feature.prototype._crs = crs;
            }
        }]);

        function Feature() {
            var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            _classCallCheck(this, Feature);

            var _this = _possibleConstructorReturn(this, (Feature.__proto__ || Object.getPrototypeOf(Feature)).call(this));

            var copy = utils.extend({}, properties);
            if (copy.crs) {
                _this._crs = copy.crs;
                delete copy.crs;
            }

            utils.init(_this, copy, true);
            return _this;
        }

        _createClass(Feature, [{
            key: 'render',
            value: function render(resolution, crs) {
                if (this._hidden || !this.symbol) return [];
                if (!this._needToRender(resolution, crs)) return this._rendered.renders;

                this._rendered = {
                    resolution: resolution,
                    crs: crs,
                    renders: this.symbol.renderFunction(this, resolution, crs)
                };

                return this._rendered.renders;
            }
        }, {
            key: '_needToRender',
            value: function _needToRender(resolution, crs) {
                return !this._rendered || this._rendered.resolution !== resolution || this._rendered.crs !== crs;
            }
        }, {
            key: 'getRenderCache',
            value: function getRenderCache() {
                return this._rendered;
            }
        }, {
            key: 'redraw',
            value: function redraw() {
                delete this._rendered;
            }
        }, {
            key: 'hide',
            value: function hide() {
                this._hidden = true;
            }
        }, {
            key: 'show',
            value: function show() {
                this._hidden = false;
            }
        }, {
            key: 'setTempSymbol',
            value: function setTempSymbol(symbol) {
                this._tempSymbol = symbol;
                this.redraw();
            }
        }, {
            key: 'clearTempSymbol',
            value: function clearTempSymbol() {
                this._tempSymbol = null;
                this.redraw();
            }
        }, {
            key: 'isTempSymbolSet',
            get: function get() {
                return !!this._tempSymbol;
            }
        }, {
            key: 'originalSymbol',
            get: function get() {
                return this._symbol;
            }
        }, {
            key: 'crs',
            get: function get() {
                return this._crs;
            }
        }, {
            key: 'symbol',
            get: function get() {
                return this._tempSymbol || this._symbol;
            },
            set: function set(symbol) {
                this._symbol = symbol;
                this.redraw();
            }
        }, {
            key: 'hidden',
            get: function get() {
                return this._hidden;
            }
        }, {
            key: 'bbox',
            get: function get() {
                return new Bbox([Math.MIN_VALUE, Math.MIN_VALUE], [Math.MAX_VALUE, Math.MAX_VALUE], this.crs);
            }
        }]);

        return Feature;
    }(EventHandler);

    utils.extend(Feature.prototype, defaults);

    return Feature;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('feature.Image', ['utils', 'Feature', 'symbol.image.Image'], function (utils, Feature, ImageSymbol) {

    'use strict';

    var defaults = {
        _src: null,
        _symbol: new ImageSymbol()
    };

    var ImageF = function (_Feature) {
        _inherits(ImageF, _Feature);

        function ImageF(bbox, properties) {
            _classCallCheck(this, ImageF);

            var _this = _possibleConstructorReturn(this, (ImageF.__proto__ || Object.getPrototypeOf(ImageF)).call(this, properties));

            _this.bbox = bbox;
            return _this;
        }

        _createClass(ImageF, [{
            key: '_needToRender',
            value: function _needToRender(resolution, crs) {
                return !this.getRenderCache();
            }
        }, {
            key: 'src',
            get: function get() {
                return this._src;
            },
            set: function set(src) {
                this._src = src;
                this.redraw();
            }
        }, {
            key: 'bbox',
            get: function get() {
                return this._bbox;
            },
            set: function set(bbox) {
                this._bbox = bbox.projectTo(this.crs);
                this.redraw();
            }
        }]);

        return ImageF;
    }(Feature);

    utils.extend(ImageF.prototype, defaults);

    return ImageF;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('feature.Label', ['utils', 'Feature', 'symbol.label.Label', 'Bbox', 'Point'], function (utils, Feature, LabelSymbol, Bbox, Point) {
    'use strict';

    var defaults = {
        _content: '',
        _symbol: new LabelSymbol()
    };

    var Label = function (_Feature) {
        _inherits(Label, _Feature);

        function Label(position, properties) {
            _classCallCheck(this, Label);

            var _this = _possibleConstructorReturn(this, (Label.__proto__ || Object.getPrototypeOf(Label)).call(this, properties));

            _this.coordinates = position;
            return _this;
        }

        _createClass(Label, [{
            key: 'position',
            get: function get() {
                return this._position;
            },
            set: function set(position) {
                this._position = position;
                this.redraw();
            }
        }, {
            key: 'point',
            get: function get() {
                return new Point(this.position, this.crs);
            },
            set: function set(point) {
                this.position = point.projectTo(this.crs).position;
            }
        }, {
            key: 'coordinates',
            get: function get() {
                return this._position.slice();
            },
            set: function set(point) {
                this.position = point.slice();
            }
        }, {
            key: 'content',
            get: function get() {
                return this._content;
            },
            set: function set(content) {
                this._content = content;
                this.redraw();
            }
        }, {
            key: 'bbox',
            get: function get() {
                return new Bbox(this.position, this.position, this.crs);
            }
        }]);

        return Label;
    }(Feature);

    utils.extend(Label.prototype, defaults);

    return Label;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('feature.Maptip', ['Feature', 'Point', 'Bbox', 'symbol.maptip.Simple'], function (Feature, Point, Bbox, MaptipSymbol) {

    'use strict';

    var Maptip = function (_Feature) {
        _inherits(Maptip, _Feature);

        function Maptip(position, properties) {
            _classCallCheck(this, Maptip);

            var _this = _possibleConstructorReturn(this, (Maptip.__proto__ || Object.getPrototypeOf(Maptip)).call(this, properties));

            _this._position = position;
            return _this;
        }

        _createClass(Maptip, [{
            key: 'projectTo',
            value: function projectTo(crs) {
                var projected = this.point.projectTo(crs);
                return new Maptip(projected.position, { crs: crs, content: this.content });
            }
        }, {
            key: 'content',
            get: function get() {
                return this._content;
            },
            set: function set(content) {
                this._content = content;
                this.redraw();
            }
        }, {
            key: 'position',
            get: function get() {
                return this._position;
            },
            set: function set(position) {
                this._position = position;
                this.redraw();
            }
        }, {
            key: 'point',
            get: function get() {
                return new Point(this.position, this.crs);
            }
        }, {
            key: 'x',
            get: function get() {
                return this.position[0];
            }
        }, {
            key: 'y',
            get: function get() {
                return this.position[1];
            }
        }, {
            key: 'bbox',
            get: function get() {
                return new Bbox(this._position, this._position, this.crs);
            }
        }]);

        return Maptip;
    }(Feature);

    Maptip.prototype._symbol = new MaptipSymbol();

    return Maptip;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('feature.MultiPoint', ['Feature', 'Point', 'Bbox', 'feature.Point', 'symbol.point.Point'], function (Feature, Point, Bbox, PointF, PointSymbol) {
    'use strict';

    var MultiPoint = function (_Feature) {
        _inherits(MultiPoint, _Feature);

        function MultiPoint() {
            var points = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
            var properties = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            _classCallCheck(this, MultiPoint);

            var _this = _possibleConstructorReturn(this, (MultiPoint.__proto__ || Object.getPrototypeOf(MultiPoint)).call(this, properties));

            _this._points = points;
            return _this;
        }

        _createClass(MultiPoint, [{
            key: 'projectTo',
            value: function projectTo(crs) {
                var _this2 = this;

                var projected = [];
                this._points.forEach(function (point) {
                    projected.push(new Point(point, _this2.crs).projectTo(crs).coordinates);
                });

                return new MultiPoint(projected, { symbol: this.symbol, crs: crs });
            }
        }, {
            key: 'clone',
            value: function clone() {
                return this.projectTo(this.crs);
            }
        }, {
            key: 'addPoint',
            value: function addPoint(point) {
                if (point.position && point.crs) {
                    this._points.push(point.projectTo(this.crs).position);
                } else {
                    this._points.push([point[0], point[1]]);
                }
                this._update();
            }
        }, {
            key: '_update',
            value: function _update() {
                this._bbox = null;
                this.redraw();
            }
        }, {
            key: 'render',
            value: function render(resolution, crs) {
                var _this3 = this;

                if (this.hidden || !this.symbol) return [];
                if (!this._needToRender(resolution, crs)) return this._rendered.renders;

                var renders = [];
                this._points.forEach(function (point) {
                    var f = new PointF(point, { crs: _this3.crs, symbol: _this3.symbol });
                    renders = renders.concat(f.render(resolution, crs));
                });

                this._rendered = {
                    resolution: resolution,
                    crs: crs,
                    renders: renders
                };

                return this._rendered.renders;
            }
        }, {
            key: 'points',
            get: function get() {
                return this._points;
            },
            set: function set(points) {
                this._points = points.slice();
                this._update();
            }
        }, {
            key: 'bbox',
            get: function get() {
                if (this._bbox) return this._bbox;
                var xMin = Number.MAX_VALUE;
                var yMin = Number.MAX_VALUE;
                var xMax = Number.MIN_VALUE;
                var yMax = Number.MIN_VALUE;

                this._points.forEach(function (point) {
                    xMin = Math.min(xMin, point[0]);
                    yMin = Math.min(yMin, point[1]);
                    xMax = Math.max(xMax, point[0]);
                    yMax = Math.max(yMax, point[1]);
                });

                this._bbox = new Bbox([xMin, yMin], [xMax, yMax], this.crs);
                return this._bbox;
            }
        }, {
            key: 'coordinates',
            get: function get() {
                return this._points.slice();
            },
            set: function set(points) {
                this.points = points;
            }
        }]);

        return MultiPoint;
    }(Feature);

    MultiPoint.prototype._symbol = new PointSymbol();

    return MultiPoint;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('feature.Point', ['utils', 'Feature', 'Crs', 'Point', 'Bbox', 'symbol.point.Point'], function (utils, Feature, Crs, Point, Bbox, PointSymbol) {

    'use strict';

    var PointF = function (_Feature) {
        _inherits(PointF, _Feature);

        function PointF(position, properties) {
            _classCallCheck(this, PointF);

            var _this = _possibleConstructorReturn(this, (PointF.__proto__ || Object.getPrototypeOf(PointF)).call(this, properties));

            _this._position = position;
            return _this;
        }

        _createClass(PointF, [{
            key: 'projectTo',
            value: function projectTo(crs) {
                var projected = Point.prototype.projectTo.call(this, crs);
                return new PointF(projected.position, { crs: crs, symbol: this.symbol });
            }
        }, {
            key: 'clone',
            value: function clone() {
                return this.projectTo(this.crs);
            }
        }, {
            key: 'bbox',
            get: function get() {
                return new Bbox(this._position, this._position, this.crs);
            }
        }, {
            key: 'position',
            get: function get() {
                return [].concat(this._position);
            },
            set: function set(position) {
                this._position = position;
                this.redraw();
            }
        }, {
            key: 'point',
            get: function get() {
                return new Point(this.position, this.crs);
            },
            set: function set(point) {
                this.position = point.projectTo(this.crs).position;
            }
        }, {
            key: 'x',
            get: function get() {
                return this._position[0];
            },
            set: function set(x) {
                this._position[0] = x;
                this.redraw();
            }
        }, {
            key: 'y',
            get: function get() {
                return this._position[1];
            },
            set: function set(y) {
                this._position[1] = y;
                this.redraw();
            }
        }, {
            key: 'coordinates',
            get: function get() {
                return this.position.slice();
            },
            set: function set(position) {
                this.position = position.slice();
            }
        }]);

        return PointF;
    }(Feature);

    PointF.prototype._symbol = new PointSymbol();

    return PointF;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('feature.Poly', ['utils', 'Feature', 'Bbox', 'geotools'], function (utils, Feature, Bbox, geotools) {

    'use strict';

    var Poly = function (_Feature) {
        _inherits(Poly, _Feature);

        function Poly(rings, properties) {
            _classCallCheck(this, Poly);

            var _this = _possibleConstructorReturn(this, (Poly.__proto__ || Object.getPrototypeOf(Poly)).call(this, properties));

            if (rings && rings.length > 0) {
                if (rings[0].length > 0 && !Array.isArray(rings[0][0])) rings = [rings];
                _this.rings = utils.copyArray(rings);
            } else {
                _this._rings = [[]];
            }
            return _this;
        }

        _createClass(Poly, [{
            key: 'addPoint',
            value: function addPoint(point, ringN) {
                if (!ringN) ringN = this._rings.length - 1;
                this.setPoint(ringN, this._rings[ringN].length, point);
            }
        }, {
            key: 'removePoint',
            value: function removePoint(ringN, index) {
                this._rings[ringN].splice(index, 1);
                if (this._rings[ringN].length === 0) {
                    this.removeRing(ringN);
                }
                this._update();
            }
        }, {
            key: 'removeRing',
            value: function removeRing(ringN) {
                this._rings.splice(ringN, 1);
                this._update();
            }
        }, {
            key: '_update',
            value: function _update() {
                this._bbox = null;
                this.redraw();
            }
        }, {
            key: 'clone',
            value: function clone() {
                return new Poly(this.rings, { crs: this.crs });
            }
        }, {
            key: 'projectTo',
            value: function projectTo(crs) {
                var projected = geotools.projectRings(this.rings, this.crs, crs);
                return new Poly(projected, { crs: crs, symbol: this.symbol });
            }
        }, {
            key: 'setRing',
            value: function setRing(ringN, ring) {
                ringN = Math.min(ringN, this._rings.length);
                this._rings[ringN] = ring;
                this._update();
            }
        }, {
            key: 'setPoint',
            value: function setPoint(ringN, pointN, point) {
                pointN = Math.min(pointN, this._rings[ringN].length);
                this._rings[ringN][pointN] = point.position && point.projectTo ? point.projectTo(this.crs).position : point;
                this._update();
            }
        }, {
            key: 'insertPoint',
            value: function insertPoint(ringN, pointN, point) {
                pointN = Math.min(pointN, this._rings[ringN].length);
                this._rings[ringN].splice(pointN, 0, [0, 0]);
                this.setPoint(ringN, pointN, point);
            }
        }, {
            key: 'rings',
            get: function get() {
                return this._rings;
            },
            set: function set(rings) {
                this._rings = rings;
                this._update();
            }
        }, {
            key: 'bbox',
            get: function get() {
                if (this._bbox) return this._bbox;
                var xMin = Number.MAX_VALUE;
                var yMin = Number.MAX_VALUE;
                var xMax = -Number.MAX_VALUE;
                var yMax = -Number.MAX_VALUE;

                this._rings.forEach(function (ring) {
                    ring.forEach(function (point) {
                        xMin = Math.min(xMin, point[0]);
                        yMin = Math.min(yMin, point[1]);
                        xMax = Math.max(xMax, point[0]);
                        yMax = Math.max(yMax, point[1]);
                    });
                });

                this._bbox = new Bbox([xMin, yMin], [xMax, yMax], this.crs);
                return this._bbox;
            }
        }, {
            key: 'centroid',
            get: function get() {
                var bbox = this.bbox;
                var x = (bbox.xMin + bbox.xMax) / 2;
                var y = (bbox.yMin + bbox.yMax) / 2;
                return [x, y];
            }
        }, {
            key: 'coordinates',
            get: function get() {
                return utils.copyArray(this._rings);
            },
            set: function set(rings) {
                this.rings = utils.copyArray(rings);
            }
        }]);

        return Poly;
    }(Feature);

    return Poly;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('feature.Polygon', ['feature.Poly', 'symbol.polygon.Simple'], function (Poly, PolygonSymbol) {

    'use strict';

    var Polygon = function (_Poly) {
        _inherits(Polygon, _Poly);

        function Polygon() {
            _classCallCheck(this, Polygon);

            return _possibleConstructorReturn(this, (Polygon.__proto__ || Object.getPrototypeOf(Polygon)).apply(this, arguments));
        }

        _createClass(Polygon, [{
            key: 'clone',
            value: function clone() {
                return new Polygon(this.rings, { crs: this.crs, symbol: this.originalSymbol });
            }
        }]);

        return Polygon;
    }(Poly);

    Polygon.prototype._symbol = new PolygonSymbol();

    Polygon.prototype.isEnclosed = true;

    return Polygon;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('feature.Polyline', ['feature.Poly', 'symbol.polyline.Simple'], function (Poly, PolylineSymbol) {

    'use strict';

    var Polyline = function (_Poly) {
        _inherits(Polyline, _Poly);

        function Polyline() {
            _classCallCheck(this, Polyline);

            return _possibleConstructorReturn(this, (Polyline.__proto__ || Object.getPrototypeOf(Polyline)).apply(this, arguments));
        }

        _createClass(Polyline, [{
            key: 'clone',
            value: function clone() {
                return new Polyline(this.rings, { crs: this.crs, symbol: this.originalSymbol });
            }
        }]);

        return Polyline;
    }(Poly);

    Polyline.prototype._symbol = new PolylineSymbol();

    return Polyline;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

sGis.module('render.Arc', [], function () {

  'use strict';

  var defaults = {
    center: null,

    radius: 5,

    strokeColor: 'black',

    strokeWidth: 1,

    fillColor: 'transparent',

    ignoreEvents: false,

    startAngle: 0,

    endAngle: 2 * Math.PI,

    isSector: false,

    clockwise: true
  };

  var Arc = function () {
    function Arc(center, options) {
      _classCallCheck(this, Arc);

      Object.assign(this, options);
      this.center = center;
    }

    _createClass(Arc, [{
      key: 'contains',
      value: function contains(position) {
        var dx = position[0] - this.center[0];
        var dy = position[1] - this.center[1];
        var distance2 = dx * dx + dy * dy;

        return distance2 < (this.radius + 2) * (this.radius + 2);
      }
    }, {
      key: 'isVector',
      get: function get() {
        return true;
      }
    }]);

    return Arc;
  }();

  Object.assign(Arc.prototype, defaults);

  return Arc;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

sGis.module('render.HtmlElement', [], function () {

    'use strict';

    var HtmlElement = function () {
        function HtmlElement(htmlText, position, onAfterDisplayed) {
            _classCallCheck(this, HtmlElement);

            this._htmlText = htmlText;
            this._position = position;
            this.onAfterDisplayed = onAfterDisplayed;
        }

        _createClass(HtmlElement, [{
            key: 'getNode',
            value: function getNode(callback) {
                var node = document.createElement('div');
                node.innerHTML = this._htmlText;
                this._lastNode = node;
                callback(null, node);
            }
        }, {
            key: 'contains',
            value: function contains(position) {
                var width = this._lastNode.clientWidth || this._lastNode.offsetWidth || 0;
                var height = this._lastNode.clientHeight || this._lastNode.offsetHeight || 0;

                return this._position[0] < position.x && this._position[1] < position.y && this._position[0] + width > position.x && this._position[1] + height > position.y;
            }
        }, {
            key: 'position',
            get: function get() {
                return this._position;
            }
        }], [{
            key: 'isVector',
            get: function get() {
                return false;
            }
        }]);

        return HtmlElement;
    }();

    return HtmlElement;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

sGis.module('render.Image', ['Point'], function (Point) {

    'use strict';

    var ImageRender = function () {
        function ImageRender(src, bbox, onAfterDisplayed) {
            _classCallCheck(this, ImageRender);

            this._src = src;
            this._bbox = bbox;
            this.onAfterDisplayed = onAfterDisplayed;
        }

        _createClass(ImageRender, [{
            key: 'getNode',
            value: function getNode(callback) {
                var node = new Image();
                node.style.opacity = this.opacity;
                node.onload = function () {
                    callback(null, node);
                };
                node.onerror = function () {
                    callback('Failed to load image', null);
                };

                node.src = this._src;

                this._node = node;
            }
        }, {
            key: 'contains',
            value: function contains(position) {
                var point = new Point([position.x * resolution, position.y * resolution], this._bbox.crs);
                return this._bbox.contains(point);
            }
        }, {
            key: 'getCache',
            value: function getCache() {
                return this._node;
            }
        }, {
            key: 'bbox',
            get: function get() {
                return this._bbox;
            }
        }], [{
            key: 'isVector',
            get: function get() {
                return false;
            }
        }]);

        return ImageRender;
    }();

    ImageRender.prototype.opacity = 1;

    return ImageRender;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

sGis.module('render.Point', [], function () {

    'use strict';

    var Point = function () {
        function Point(coordinates, properties) {
            _classCallCheck(this, Point);

            this._coord = coordinates;
            Object.assign(this, properties);
        }

        _createClass(Point, [{
            key: 'contains',
            value: function contains(position) {
                var dx = position.x - this._coord[0],
                    dy = position.y - this._coord[1],
                    distance2 = dx * dx + dy * dy;
                return Math.sqrt(distance2) < 2;
            }
        }, {
            key: 'isVector',
            get: function get() {
                return true;
            }
        }, {
            key: 'coordinates',
            get: function get() {
                return this._coord;
            }
        }]);

        return Point;
    }();

    Point.prototype.color = 'black';

    Point.prototype.ignoreEvents = false;

    return Point;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

sGis.module('render.Polygon', ['utils', 'geotools'], function (utils, geotools) {

  'use strict';

  var defaults = {
    fillStyle: 'color',

    fillColor: 'transparent',

    fillImage: null,

    strokeColor: 'black',

    strokeWidth: 1,

    ignoreEvents: false,

    lineContainsTolerance: 2,

    lineDash: []
  };

  var Polygon = function () {
    function Polygon(coordinates, options) {
      _classCallCheck(this, Polygon);

      if (!coordinates) coordinates = [];
      if (!utils.isArray(coordinates[0])) coordinates = [coordinates];
      if (!utils.isArray(coordinates[0][0])) coordinates = [coordinates];

      utils.init(this, options);
      this.coordinates = coordinates;
    }

    _createClass(Polygon, [{
      key: 'contains',
      value: function contains(position) {
        return geotools.contains(this.coordinates, position, this.strokeWidth / 2 + this.lineContainsTolerance);
      }
    }, {
      key: 'isVector',
      get: function get() {
        return true;
      }
    }]);

    return Polygon;
  }();

  utils.extend(Polygon.prototype, defaults);

  return Polygon;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

sGis.module('render.Polyline', ['utils', 'geotools'], function (utils, geotools) {

    'use strict';

    var defaults = {
        strokeColor: 'black',

        strokeWidth: 1,

        ignoreEvents: false,

        lineContainsTolerance: 4,

        lineDash: []
    };

    var Polyline = function () {
        function Polyline(coordinates, options) {
            _classCallCheck(this, Polyline);

            if (!coordinates) coordinates = [];
            if (!utils.isArray(coordinates[0])) coordinates = [coordinates];
            if (!utils.isArray(coordinates[0][0])) coordinates = [coordinates];

            utils.init(this, options);
            this.coordinates = coordinates;
        }

        _createClass(Polyline, [{
            key: 'contains',
            value: function contains(position) {
                for (var ring = 0, l = this.coordinates.length; ring < l; ring++) {
                    for (var i = 1, m = this.coordinates[ring].length; i < m; i++) {
                        if (geotools.pointToLineDistance(position, [this.coordinates[ring][i - 1], this.coordinates[ring][i]]) < this.strokeWidth / 2 + this.lineContainsTolerance) return [ring, i - 1];
                    }
                }
                return false;
            }
        }, {
            key: 'isVector',
            get: function get() {
                return true;
            }
        }]);

        return Polyline;
    }();

    utils.extend(Polyline.prototype, defaults);

    return Polyline;
});
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

sGis.module('serializer.symbolSerializer', ['utils'], function (utils) {

    'use strict';

    var symbolDescriptions = {};

    return {
        registerSymbol: function registerSymbol(constructor, description, properties) {
            symbolDescriptions[description] = { Constructor: constructor, properties: properties };
        },

        serialize: function serialize(symbol) {
            var keys = Object.keys(symbolDescriptions);
            for (var i = 0; i < keys.length; i++) {
                var desc = symbolDescriptions[keys[i]];

                if (symbol instanceof desc.Constructor) {
                    var _ret = function () {
                        var serialized = { symbolName: keys[i] };
                        desc.properties.forEach(function (prop) {
                            serialized[prop] = symbol[prop];
                        });
                        return {
                            v: serialized
                        };
                    }();

                    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
                }
            }

            utils.error('Unknown type of symbol.');
        },

        deserialize: function deserialize(desc) {
            if (!symbolDescriptions[desc.symbolName]) utils.error('Unknown type of symbol.');
            var symbol = new symbolDescriptions[desc.symbolName].Constructor();
            symbolDescriptions[desc.symbolName].properties.forEach(function (prop) {
                symbol[prop] = desc[prop];
            });

            return symbol;
        }
    };
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('symbol.Editor', ['Symbol', 'symbol.point.Point', 'symbol.point.Image', 'render.Point', 'render.Polyline', 'render.Polygon', 'render.Arc'], function (_Symbol, PointSymbol, PointImageSymbol, PointRender, PolylineRender, PolygonRender, ArcRender) {

    'use strict';

    var EditorSymbol = function (_Symbol2) {
        _inherits(EditorSymbol, _Symbol2);

        function EditorSymbol(properties) {
            _classCallCheck(this, EditorSymbol);

            return _possibleConstructorReturn(this, (EditorSymbol.__proto__ || Object.getPrototypeOf(EditorSymbol)).call(this, properties));
        }

        _createClass(EditorSymbol, [{
            key: 'renderFunction',
            value: function renderFunction(feature, resolution, crs) {
                var baseRender = this.baseSymbol.renderFunction(feature, resolution, crs);
                var halo;
                for (var i = 0; i < baseRender.length; i++) {
                    if (baseRender[i] instanceof ArcRender) {
                        halo = new ArcRender(baseRender[i].center, {
                            fillColor: this.color,
                            radius: parseFloat(baseRender[i].radius) + this.haloSize,
                            strokeColor: 'transparent'
                        });
                        break;
                    } else if (baseRender[i] instanceof PolygonRender) {
                        halo = new PolygonRender(baseRender[i].coordinates, {
                            strokeColor: this.color,
                            fillColor: this.color,
                            strokeWidth: parseFloat(baseRender[i].strokeWidth) + 2 * this.haloSize
                        });
                        break;
                    } else if (baseRender[i] instanceof PolylineRender) {
                        halo = new PolylineRender(baseRender[i].coordinates, {
                            strokeColor: this.color,
                            strokeWidth: parseFloat(baseRender[i].strokeWidth) + 2 * this.haloSize
                        });
                        break;
                    } else if (this.baseSymbol instanceof PointImageSymbol) {
                        halo = new ArcRender([baseRender[i].position[0] + +this.baseSymbol.anchorPoint.x, baseRender[i].position[1] + +this.baseSymbol.anchorPoint.y], {
                            fillColor: this.color,
                            radius: this.baseSymbol.width / 2 + this.haloSize,
                            strokeColor: 'transparent' });
                        break;
                    }
                }

                if (halo) baseRender.unshift(halo);
                return baseRender;
            }
        }]);

        return EditorSymbol;
    }(_Symbol);

    EditorSymbol.prototype.baseSymbol = new PointSymbol();

    EditorSymbol.prototype.color = 'rgba(97,239,255,0.5)';

    EditorSymbol.prototype.haloSize = 5;

    return EditorSymbol;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('symbol.image.Image', ['Symbol', 'render.Image', 'serializer.symbolSerializer'], function (_Symbol, ImageRender, symbolSerializer) {

    'use strict';

    var ImageSymbol = function (_Symbol2) {
        _inherits(ImageSymbol, _Symbol2);

        function ImageSymbol(properties) {
            _classCallCheck(this, ImageSymbol);

            return _possibleConstructorReturn(this, (ImageSymbol.__proto__ || Object.getPrototypeOf(ImageSymbol)).call(this, properties));
        }

        _createClass(ImageSymbol, [{
            key: 'renderFunction',
            value: function renderFunction(feature, resolution, crs) {
                var _this2 = this;

                var render = new ImageRender(feature.src, feature.bbox);

                if (this.transitionTime > 0) {
                    render.opacity = 0;
                    render.onAfterDisplayed = function (node) {
                        setTimeout(function () {
                            node.style.transition = 'opacity ' + _this2.transitionTime / 1000 + 's linear';
                            node.style.opacity = _this2.opacity;
                        }, 0);
                    };
                } else {
                    render.opacity = this.opacity;
                }

                return [render];
            }
        }]);

        return ImageSymbol;
    }(_Symbol);

    ImageSymbol.prototype.transitionTime = 0;

    ImageSymbol.prototype.opacity = 1;

    symbolSerializer.registerSymbol(ImageSymbol, 'image.Image', ['transitionTime', 'opacity']);

    return ImageSymbol;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('symbol.label.Label', ['utils', 'Symbol', 'render.HtmlElement'], function (utils, _Symbol, HtmlElement) {

    'use strict';

    var Label = function (_Symbol2) {
        _inherits(Label, _Symbol2);

        function Label(properties) {
            _classCallCheck(this, Label);

            return _possibleConstructorReturn(this, (Label.__proto__ || Object.getPrototypeOf(Label)).call(this, properties));
        }

        _createClass(Label, [{
            key: 'renderFunction',
            value: function renderFunction(feature, resolution, crs) {
                var html = '<div' + (this.css ? ' class="' + this.css + '"' : '') + '>' + feature.content + '</div>';
                var point = feature.point.projectTo(crs);
                var position = [point.x / resolution, -point.y / resolution];

                return [new HtmlElement(html, position)];
            }
        }]);

        return Label;
    }(_Symbol);

    Label.prototype.css = 'sGis-symbol-label-center-top';

    utils.setCssClasses({
        'sGis-symbol-label-left-top': 'transform:translate(-120%,-120%);',
        'sGis-symbol-label-left-middle': 'transform:translate(-120%,-50%);',
        'sGis-symbol-label-left-bottom': 'transform:translate(-120%,20%);',
        'sGis-symbol-label-center-top': 'transform:translate(-50%,-120%);',
        'sGis-symbol-label-center-middle': 'transform:translate(-50%,-50%);',
        'sGis-symbol-label-center-bottom': 'transform:translate(-50%,20%);',
        'sGis-symbol-label-right-top': 'transform:translate(20%,-120%);',
        'sGis-symbol-label-right-middle': 'transform:translate(20%,-50%);',
        'sGis-symbol-label-right-bottom': 'transform:translate(20%,20%);'
    });

    return Label;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('symbol.maptip.Simple', ['utils', 'Symbol', 'render.Polygon', 'render.HtmlElement'], function (utils, _Symbol, PolygonRender, HtmlElement) {

    'use strict';

    var MaptipSymbol = function (_Symbol2) {
        _inherits(MaptipSymbol, _Symbol2);

        function MaptipSymbol(properties) {
            _classCallCheck(this, MaptipSymbol);

            return _possibleConstructorReturn(this, (MaptipSymbol.__proto__ || Object.getPrototypeOf(MaptipSymbol)).call(this, properties));
        }

        _createClass(MaptipSymbol, [{
            key: 'renderFunction',
            value: function renderFunction(feature, resolution, crs) {
                var position = feature.point.projectTo(crs).position;
                var pxPosition = [position[0] / resolution, position[1] / resolution];
                var render = new HtmlElement('<div class="sGis-maptip-outerContainer"><div class="sGis-maptip-innerContainer">' + feature.content + '</div></div>', pxPosition);

                return [render];
            }
        }]);

        return MaptipSymbol;
    }(_Symbol);

    utils._setStyleNode('\n\n        .sGis-maptip-outerContainer {\n            transform: translate(-50%, -100%);\n        }\n        \n        .sGis-maptip-innerContainer {\n            background-color: white;\n            transform: translate(0, -16px);\n            padding: 8px;\n            border-radius: 5px;\n            position: relative;\n            box-shadow: 0 0 6px #B2B2B2;\n        }\n        \n        .sGis-maptip-innerContainer:after {\n            content: \' \';\n            position: absolute;\n            display: block;\n            background: white;\n            top: 100%;\n            left: 50%;\n            height: 20px;\n            width: 20px;\n            transform: translate(-50%, -10px) rotate(45deg);\n            box-shadow: 2px 2px 2px 0 rgba( 178, 178, 178, .4 );\n        }\n\n    ');

    return MaptipSymbol;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('symbol.polyline.Simple', ['utils', 'math', 'Symbol', 'render.Polyline', 'serializer.symbolSerializer'], function (utils, math, _Symbol, Polyline, symbolSerializer) {

    'use strict';

    var PolylineSymbol = function (_Symbol2) {
        _inherits(PolylineSymbol, _Symbol2);

        function PolylineSymbol(properties) {
            _classCallCheck(this, PolylineSymbol);

            return _possibleConstructorReturn(this, (PolylineSymbol.__proto__ || Object.getPrototypeOf(PolylineSymbol)).call(this, properties));
        }

        _createClass(PolylineSymbol, [{
            key: 'renderFunction',
            value: function renderFunction(feature, resolution, crs) {
                var coordinates = PolylineSymbol._getRenderedCoordinates(feature, resolution, crs);
                if (!coordinates) return [];
                return [new Polyline(coordinates, { strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, lineDash: this.lineDash })];
            }
        }], [{
            key: '_getRenderedCoordinates',
            value: function _getRenderedCoordinates(feature, resolution, crs) {
                if (!feature.coordinates || !utils.isArray(feature.coordinates) || !utils.isArray(feature.coordinates[0])) return null;
                var projected = feature.crs.equals(crs) ? feature.rings : feature.projectTo(crs).rings;

                return math.simplifyCoordinates(projected.map(function (ring) {
                    return ring.map(function (point) {
                        return [point[0] / resolution, point[1] / -resolution];
                    });
                }), 1);
            }
        }]);

        return PolylineSymbol;
    }(_Symbol);

    PolylineSymbol.prototype.strokeColor = 'black';

    PolylineSymbol.prototype.strokeWidth = 1;

    PolylineSymbol.prototype.lineDash = [];

    symbolSerializer.registerSymbol(PolylineSymbol, 'polyline.Simple', ['strokeColor', 'strokeWidth']);

    return PolylineSymbol;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

sGis.module('Symbol', ['utils', 'serializer.symbolSerializer'], function (utils, symbolSerializer) {

    'use strict';

    var _Symbol = function () {
        function _Symbol(properties) {
            _classCallCheck(this, _Symbol);

            utils.init(this, properties, true);
        }

        _createClass(_Symbol, [{
            key: 'renderFunction',
            value: function renderFunction(feature, resolution, crs) {
                return [];
            }
        }, {
            key: 'clone',
            value: function clone() {
                var desc = symbolSerializer.serialize(this);
                return symbolSerializer.deserialize(desc);
            }
        }]);

        return _Symbol;
    }();

    return _Symbol;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

sGis.module('utils.Color', ['utils'], function (utils) {

    'use strict';

    var Color = function () {
        function Color(string) {
            _classCallCheck(this, Color);

            this._original = string;
            this._color = string && string.trim() || 'transparent';
            this._setChannels();
        }

        _createClass(Color, [{
            key: '_setChannels',
            value: function _setChannels() {
                var format = this.format;
                if (format && formats[format]) {
                    this._channels = formats[format](this._color);
                } else {
                    this._channels = {};
                }
            }
        }, {
            key: 'toString',
            value: function toString(format) {
                if (format === 'hex') {
                    return '#' + decToHex(this.a) + decToHex(this.r) + decToHex(this.g) + decToHex(this.b);
                } else if (format === 'rgb') {
                    return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
                } else {
                    return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + (this.a / 255).toFixed(2).replace(/\.*0+$/, '') + ')';
                }
            }
        }, {
            key: 'original',
            get: function get() {
                return this._original;
            }
        }, {
            key: 'isValid',
            get: function get() {
                return !!(utils.isNumber(this._channels.a) && utils.isNumber(this._channels.r) && utils.isNumber(this._channels.g) && utils.isNumber(this._channels.b));
            }
        }, {
            key: 'format',
            get: function get() {
                if (this._color.substr(0, 1) === '#' && this._color.search(/[^#0-9a-fA-F]/) === -1) {
                    if (this._color.length === 4) {
                        return 'hex3';
                    } else if (this._color.length === 7) {
                        return 'hex6';
                    } else if (this._color.length === 5) {
                        return 'hex4';
                    } else if (this._color.length === 9) {
                        return 'hex8';
                    }
                } else if (this._color.substr(0, 4) === 'rgb(') {
                    return 'rgb';
                } else if (this._color.substr(0, 5) === 'rgba(') {
                    return 'rgba';
                } else if (this._color in Color.names) {
                    return 'name';
                }
            }
        }, {
            key: 'r',
            get: function get() {
                return this._channels.r;
            },
            set: function set(v) {
                this._channels.r = v;
            }
        }, {
            key: 'g',
            get: function get() {
                return this._channels.g;
            },
            set: function set(v) {
                this._channels.g = v;
            }
        }, {
            key: 'b',
            get: function get() {
                return this._channels.b;
            },
            set: function set(v) {
                this._channels.b = v;
            }
        }, {
            key: 'a',
            get: function get() {
                return this._channels.a;
            },
            set: function set(v) {
                this._channels.a = v;
            }
        }, {
            key: 'channels',
            get: function get() {
                return Object.assign({}, this._channels);
            }
        }]);

        return Color;
    }();

    function decToHex(dec) {
        var hex = Math.floor(dec).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }

    var formats = {
        hex3: function hex3(string) {
            return {
                r: parseInt(string.substr(1, 1) + string.substr(1, 1), 16),
                g: parseInt(string.substr(2, 1) + string.substr(2, 1), 16),
                b: parseInt(string.substr(3, 1) + string.substr(3, 1), 16),
                a: 255
            };
        },
        hex6: function hex6(string) {
            return {
                r: parseInt(string.substr(1, 2), 16),
                g: parseInt(string.substr(3, 2), 16),
                b: parseInt(string.substr(5, 2), 16),
                a: 255
            };
        },
        hex4: function hex4(string) {
            return {
                r: parseInt(string.substr(2, 1) + string.substr(2, 1), 16),
                g: parseInt(string.substr(3, 1) + string.substr(3, 1), 16),
                b: parseInt(string.substr(4, 1) + string.substr(4, 1), 16),
                a: parseInt(string.substr(1, 1) + string.substr(1, 1), 16)
            };
        },
        hex8: function hex8(string) {
            return {
                r: parseInt(string.substr(3, 2), 16),
                g: parseInt(string.substr(5, 2), 16),
                b: parseInt(string.substr(7, 2), 16),
                a: parseInt(string.substr(1, 2), 16)
            };
        },
        rgb: function rgb(string) {
            var percents = string.match(/%/g);
            if (!percents || percents.length === 3) {
                var channels = string.substring(string.search(/\(/) + 1, string.length - 1).split(',');
                for (var i = 0; i < 3; i++) {
                    if (channels[i]) {
                        channels[i] = channels[i].trim();
                        var percent = channels[i].match(/[\.\d\-]+%/);
                        if (percent) {
                            var points = channels[i].match(/\./g);
                            channels[i] = channels[i].search(/[^\d\.\-%]/) === -1 && (!points || points.length < 2) ? parseFloat(percent[0]) : NaN;
                            if (channels[i] < 0) {
                                channels[i] = 0;
                            } else if (channels[i] > 100) {
                                channels[i] = 100;
                            }
                            channels[i] = Math.floor(channels[i] * 255 / 100);
                        } else {
                            channels[i] = channels[i] && channels[i].match(/[^ \-0-9]/) === null && channels[i].match(/[0-9]+/g).length === 1 ? parseInt(channels[i]) : NaN;
                            if (channels[i] < 0) {
                                channels[i] = 0;
                            } else if (channels[i] > 255) {
                                channels[i] = 255;
                            }
                        }
                    }
                }
            } else {
                channels = [];
            }
            return {
                r: channels[0],
                g: channels[1],
                b: channels[2],
                a: 255
            };
        },

        rgba: function rgba(string) {
            var channels = formats.rgb(string);
            channels.a = undefined;

            var match = string.match(/[\-0-9\.]+/g);
            if (match && match[3]) {
                var points = match[3].match(/\./g);
                if (!points || points.length === 1) {
                    channels.a = parseFloat(match[3]);
                    if (channels.a < 0) {
                        channels.a = 0;
                    } else if (channels.a > 1) {
                        channels.a = 1;
                    }
                    channels.a = Math.round(channels.a * 255);
                }
            }
            return channels;
        },
        name: function name(string) {
            var color = new Color('#' + Color.names[string]);
            return color.channels;
        }
    };

    Color.names = {
        aliceblue: "f0f8ff",
        antiquewhite: "faebd7",
        aqua: "0ff",
        aquamarine: "7fffd4",
        azure: "f0ffff",
        beige: "f5f5dc",
        bisque: "ffe4c4",
        black: "000",
        blanchedalmond: "ffebcd",
        blue: "00f",
        blueviolet: "8a2be2",
        brown: "a52a2a",
        burlywood: "deb887",
        burntsienna: "ea7e5d",
        cadetblue: "5f9ea0",
        chartreuse: "7fff00",
        chocolate: "d2691e",
        coral: "ff7f50",
        cornflowerblue: "6495ed",
        cornsilk: "fff8dc",
        crimson: "dc143c",
        cyan: "0ff",
        darkblue: "00008b",
        darkcyan: "008b8b",
        darkgoldenrod: "b8860b",
        darkgray: "a9a9a9",
        darkgreen: "006400",
        darkgrey: "a9a9a9",
        darkkhaki: "bdb76b",
        darkmagenta: "8b008b",
        darkolivegreen: "556b2f",
        darkorange: "ff8c00",
        darkorchid: "9932cc",
        darkred: "8b0000",
        darksalmon: "e9967a",
        darkseagreen: "8fbc8f",
        darkslateblue: "483d8b",
        darkslategray: "2f4f4f",
        darkslategrey: "2f4f4f",
        darkturquoise: "00ced1",
        darkviolet: "9400d3",
        deeppink: "ff1493",
        deepskyblue: "00bfff",
        dimgray: "696969",
        dimgrey: "696969",
        dodgerblue: "1e90ff",
        firebrick: "b22222",
        floralwhite: "fffaf0",
        forestgreen: "228b22",
        fuchsia: "f0f",
        gainsboro: "dcdcdc",
        ghostwhite: "f8f8ff",
        gold: "ffd700",
        goldenrod: "daa520",
        gray: "808080",
        green: "008000",
        greenyellow: "adff2f",
        grey: "808080",
        honeydew: "f0fff0",
        hotpink: "ff69b4",
        indianred: "cd5c5c",
        indigo: "4b0082",
        ivory: "fffff0",
        khaki: "f0e68c",
        lavender: "e6e6fa",
        lavenderblush: "fff0f5",
        lawngreen: "7cfc00",
        lemonchiffon: "fffacd",
        lightblue: "add8e6",
        lightcoral: "f08080",
        lightcyan: "e0ffff",
        lightgoldenrodyellow: "fafad2",
        lightgray: "d3d3d3",
        lightgreen: "90ee90",
        lightgrey: "d3d3d3",
        lightpink: "ffb6c1",
        lightsalmon: "ffa07a",
        lightseagreen: "20b2aa",
        lightskyblue: "87cefa",
        lightslategray: "789",
        lightslategrey: "789",
        lightsteelblue: "b0c4de",
        lightyellow: "ffffe0",
        lime: "0f0",
        limegreen: "32cd32",
        linen: "faf0e6",
        magenta: "f0f",
        maroon: "800000",
        mediumaquamarine: "66cdaa",
        mediumblue: "0000cd",
        mediumorchid: "ba55d3",
        mediumpurple: "9370db",
        mediumseagreen: "3cb371",
        mediumslateblue: "7b68ee",
        mediumspringgreen: "00fa9a",
        mediumturquoise: "48d1cc",
        mediumvioletred: "c71585",
        midnightblue: "191970",
        mintcream: "f5fffa",
        mistyrose: "ffe4e1",
        moccasin: "ffe4b5",
        navajowhite: "ffdead",
        navy: "000080",
        oldlace: "fdf5e6",
        olive: "808000",
        olivedrab: "6b8e23",
        orange: "ffa500",
        orangered: "ff4500",
        orchid: "da70d6",
        palegoldenrod: "eee8aa",
        palegreen: "98fb98",
        paleturquoise: "afeeee",
        palevioletred: "db7093",
        papayawhip: "ffefd5",
        peachpuff: "ffdab9",
        peru: "cd853f",
        pink: "ffc0cb",
        plum: "dda0dd",
        powderblue: "b0e0e6",
        purple: "800080",
        rebeccapurple: "663399",
        red: "f00",
        rosybrown: "bc8f8f",
        royalblue: "4169e1",
        saddlebrown: "8b4513",
        salmon: "fa8072",
        sandybrown: "f4a460",
        seagreen: "2e8b57",
        seashell: "fff5ee",
        sienna: "a0522d",
        silver: "c0c0c0",
        skyblue: "87ceeb",
        slateblue: "6a5acd",
        slategray: "708090",
        slategrey: "708090",
        snow: "fffafa",
        springgreen: "00ff7f",
        steelblue: "4682b4",
        tan: "d2b48c",
        teal: "008080",
        thistle: "d8bfd8",
        tomato: "ff6347",
        turquoise: "40e0d0",
        violet: "ee82ee",
        wheat: "f5deb3",
        white: "fff",
        whitesmoke: "f5f5f5",
        yellow: "ff0",
        yellowgreen: "9acd32",
        transparent: '0000'
    };

    return Color;
});
'use strict';

sGis.module('math', [], function () {
    'use strict';

    var math = {
        degToRad: function degToRad(d) {
            return d / 180 * Math.PI;
        },

        radToDeg: function radToDeg(r) {
            return r / Math.PI * 180;
        },

        softEquals: function softEquals(a, b) {
            return Math.abs(a - b) < math.tolerance * a;
        },

        tolerance: 0.000001,

        extendCoordinates: function extendCoordinates(coord, center) {
            coord.forEach(function (point) {
                point[0] = point[0] - center[0];
                point[1] = point[1] - center[1];
                point[2] = 1;
            });
        },

        collapseCoordinates: function collapseCoordinates(coord, center) {
            coord.forEach(function (point) {
                point[0] = point[0] + center[0];
                point[1] = point[1] + center[1];
                point.splice(2, 1);
            });
        },

        simplifyCoordinates: function simplifyCoordinates(rings, tolerance) {
            var result = [];

            for (var ring = 0, l = rings.length; ring < l; ring++) {
                var simplified = [rings[ring][0]];
                for (var i = 1, len = rings[ring].length - 1; i < len; i++) {
                    if (rings[ring][i].length === 0 || simplified[simplified.length - 1].length === 0 || Math.abs(rings[ring][i][0] - simplified[simplified.length - 1][0]) > tolerance || Math.abs(rings[ring][i][1] - simplified[simplified.length - 1][1]) > tolerance) {
                        simplified.push(rings[ring][i]);
                    }
                }
                if (simplified[simplified.length - 1] !== rings[ring][rings[ring].length - 1]) simplified.push(rings[ring][rings[ring].length - 1]);
                result[ring] = simplified;
            }

            return result;
        },

        multiplyMatrix: function multiplyMatrix(a, b) {
            var c = [];
            for (var i = 0, m = a.length; i < m; i++) {
                c[i] = [];
                for (var j = 0, q = b[0].length; j < q; j++) {
                    c[i][j] = 0;
                    for (var r = 0, n = b.length; r < n; r++) {
                        c[i][j] += a[i][r] * b[r][j];
                    }
                }
            }

            return c;
        }
    };

    return math;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

sGis.module('utils.StateManager', ['utils'], function (utils) {

    'use strict';

    var StateManager = function () {
        function StateManager() {
            var maxStates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 256;

            _classCallCheck(this, StateManager);

            if (!utils.isNumber(maxStates) || maxStates < 0) utils.error("Incorrect value for number of states: " + maxStates);
            this._maxStates = maxStates;
            this.clear();
        }

        _createClass(StateManager, [{
            key: 'clear',
            value: function clear() {
                this._states = [];
                this._activeState = -1;
            }
        }, {
            key: 'setState',
            value: function setState(state) {
                var index = this._activeState + 1;

                this._states[index] = state;
                this._states.splice(index + 1, this._states.length);

                this._trimStates();
                this._activeState = this._states.length - 1;
            }
        }, {
            key: 'getCurrentState',
            value: function getCurrentState() {
                return this._states[this._activeState];
            }
        }, {
            key: 'undo',
            value: function undo() {
                if (this._activeState <= 0) return null;
                return this._states[--this._activeState];
            }
        }, {
            key: 'redo',
            value: function redo() {
                if (this._activeState === this._states.length - 1) return null;
                return this._states[++this._activeState];
            }
        }, {
            key: '_trimStates',
            value: function _trimStates() {
                while (this._states.length > this._maxStates) {
                    this._states.shift();
                }
            }
        }]);

        return StateManager;
    }();

    return StateManager;
});
'use strict';

sGis.module('utils', ['event'], function (ev) {
    'use strict';

    var utils = {
        error: function error(message) {
            throw new Error(message);
        },

        init: function init(object, options, setUndefined) {
            if (!options) return;

            var keys = Object.keys(options);
            keys.forEach(function (key) {
                if ((setUndefined || object[key] !== undefined) && options[key] !== undefined) {
                    try {
                        object[key] = options[key];
                    } catch (e) {
                        if (!(e instanceof TypeError)) utils.error(e);
                    }
                }
            });
        },

        requestAnimationFrame: function requestAnimationFrame(callback, element) {
            var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

            if (requestAnimationFrame) {
                requestAnimationFrame(callback, element);
            } else {
                setTimeout(function () {
                    callback();
                }, 1000 / 30);
            }
        },

        extend: function extend(target, source) {
            var ignoreUndefined = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var keys = Object.keys(source);
            keys.forEach(function (key) {
                if (ignoreUndefined && source[key] === undefined) return;
                target[key] = source[key];
            });
            return target;
        },

        softEquals: function softEquals(a, b) {
            return Math.abs(a - b) < 0.000001 * Math.max(a, 1);
        },

        isArray: function isArray(obj) {
            return Array.isArray(obj);
        },

        isNumber: function isNumber(n) {
            return typeof n === 'number' && isFinite(n);
        },

        isInteger: function isInteger(n) {
            return utils.isNumber(n) && Math.round(n) === n;
        },

        isString: function isString(s) {
            return typeof s === 'string';
        },

        isFunction: function isFunction(f) {
            return typeof f === 'function';
        },

        isNode: function isNode(o) {
            return !!o.nodeType;
        },

        isImage: function isImage(o) {
            return utils.browser.indexOf('Opera') !== 0 && o instanceof Image || o instanceof HTMLImageElement;
        },

        validateString: function validateString(s) {
            if (!utils.isString(s)) utils.error('String is expected but got ' + s + ' instead');
        },

        validateValue: function validateValue(v, allowed) {
            if (allowed.indexOf(v) === -1) utils.error('Invalid value of the argument: ' + v);
        },

        validateNumber: function validateNumber(n) {
            if (!utils.isNumber(n)) utils.error('Number is expected but got ' + n + ' instead');
        },

        validatePositiveNumber: function validatePositiveNumber(n) {
            if (!utils.isNumber(n) || n <= 0) utils.error('Positive number is expected but got ' + n + ' instead');
        },

        validateBool: function validateBool(b) {
            if (b !== true && b !== false) utils.error('Boolean is expected but got ' + b + ' instead');
        },

        getGuid: function getGuid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : r & 0x3 | 0x8;return v.toString(16);
            });
        },

        html: function html(element, _html) {
            try {
                element.innerHTML = _html;
            } catch (e) {
                var tempElement = document.createElement('div');
                tempElement.innerHTML = _html;
                for (var i = tempElement.childNodes.length - 1; i >= 0; i--) {
                    element.insertBefore(tempElement.childNodes[i], tempElement.childNodes[i + 1]);
                }
            }
        },

        arrayIntersect: function arrayIntersect(arr1, arr2) {
            for (var i = 0; i < arr1.length; i++) {
                if (arr2.indexOf(arr1[i]) !== -1) {
                    return true;
                }
            }
            return false;
        },

        copyArray: function copyArray(arr) {
            var copy = [];
            for (var i = 0, l = arr.length; i < l; i++) {
                if (utils.isArray(arr[i])) {
                    copy[i] = utils.copyArray(arr[i]);
                } else {
                    copy[i] = arr[i];
                }
            }
            return copy;
        },

        copyObject: function copyObject(obj) {
            if (!(obj instanceof Function) && obj instanceof Object) {
                var copy = utils.isArray(obj) ? [] : {};
                var keys = Object.keys(obj);
                for (var i = 0; i < keys.length; i++) {
                    copy[keys[i]] = utils.copyObject(obj[keys[i]]);
                }
                return copy;
            } else {
                return obj;
            }
        },

        setCssClasses: function setCssClasses(desc) {
            var classes = Object.keys(desc).map(function (key) {
                return utils._getCssText(key, desc[key]);
            });
            utils._setStyleNode(classes.join('\n'));
        },

        _getCssText: function _getCssText(className, styles) {
            return '.' + className + '{' + styles + '}';
        },

        _setStyleNode: function _setStyleNode(text) {
            var node = document.createElement('style');
            node.type = 'text/css';
            if (node.styleSheet) {
                node.styleSheet.cssText = text;
            } else {
                node.appendChild(document.createTextNode(text));
            }

            document.head.appendChild(node);
        },

        browser: function () {
            var ua = navigator.userAgent,
                tem = void 0,
                M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            if (/trident/i.test(M[1])) {
                tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                return 'IE ' + (tem[1] || '');
            }
            if (M[1] === 'Chrome') {
                tem = ua.match(/\bOPR\/(\d+)/);
                if (tem != null) return 'Opera ' + tem[1];
            }
            M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
            if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
            return M.join(' ');
        }(),

        createNode: function createNode(nodeName, cssClass) {
            var properties = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            var children = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

            var node = document.createElement(nodeName);
            node.className = cssClass;
            utils.extend(node, properties);
            children.forEach(function (child) {
                return node.appendChild(child);
            });
            return node;
        }
    };

    utils.isIE = utils.browser.search('IE') !== -1;
    utils.isTouch = 'ontouchstart' in document.documentElement;

    if (document.body) {
        setCssRules();
    } else {
        ev.add(document, 'DOMContentLoaded', setCssRules);
    }

    function setCssRules() {
        utils.css = {
            transition: document.body.style.transition !== undefined ? { func: 'transition', rule: 'transition' } : document.body.style.webkitTransition !== undefined ? { func: 'webkitTransition', rule: '-webkit-transition' } : document.body.style.msTransition !== undefined ? { func: 'msTransition', rule: '-ms-transition' } : document.body.style.OTransition !== undefined ? { func: 'OTransition', rule: '-o-transition' } : null,
            transform: document.body.style.transform !== undefined ? { func: 'transform', rule: 'transform' } : document.body.style.webkitTransform !== undefined ? { func: 'webkitTransform', rule: '-webkit-transform' } : document.body.style.OTransform !== undefined ? { func: 'OTransform', rule: '-o-transform' } : document.body.style.msTransform !== undefined ? { func: 'msTransform', rule: '-ms-transform' } : null,
            transformOrigin: document.body.style.transformOrigin !== undefined ? { func: 'transformOrigin', rule: 'transform-origin' } : document.body.style.webkitTransformOrigin !== undefined ? { func: 'webkitTransformOrigin', rule: '-webkit-transform-origin' } : document.body.style.OTransformOrigin !== undefined ? { func: 'OTransformOrigin', rule: '-o-transform-origin' } : document.body.style.msTransformOrigin !== undefined ? { func: 'msTransformOrigin', rule: '-ms-transform-origin' } : null
        };
    }

    if (!Object.defineProperty) {
        Object.defineProperty = function (obj, key, desc) {
            if (desc.value) {
                obj[key] = desc.value;
            } else {
                if (desc.get) {
                    obj.__defineGetter__(key, desc.get);
                }
                if (desc.set) {
                    obj.__defineSetter__(key, desc.set);
                }
            }
        };
    }

    if (!Object.defineProperties) {
        Object.defineProperties = function (obj, desc) {
            for (var key in desc) {
                Object.defineProperty(obj, key, desc[key]);
            }
        };
    }

    return utils;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

sGis.module('painter.domPainter.Canvas', ['render.Arc', 'render.Point', 'render.Polygon', 'render.Polyline', 'utils'], function (Arc, Point, Polygon, Polyline, utils) {

    'use strict';

    var Canvas = function () {
        function Canvas() {
            _classCallCheck(this, Canvas);

            this._setNode();
        }

        _createClass(Canvas, [{
            key: '_setNode',
            value: function _setNode() {
                this._canvasNode = document.createElement('canvas');
                this._canvasNode.style.pointerEvents = 'none';
                this._ctx = this._canvasNode.getContext('2d');
            }
        }, {
            key: 'reset',
            value: function reset(bbox, resolution, width, height) {
                this._ctx.clearRect(0, 0, this._canvasNode.width, this._canvasNode.height);

                this._canvasNode.width = width;
                this._canvasNode.height = height;
                this._isEmpty = true;

                this._ctx.translate(-bbox.xMin / resolution, bbox.yMax / resolution);
            }
        }, {
            key: 'draw',
            value: function draw(render) {
                if (render instanceof Arc) {
                    this._drawArc(render);
                } else if (render instanceof Point) {
                    this._drawPoint(render);
                } else if (render instanceof Polyline || render instanceof Polygon) {
                    this._drawPoly(render);
                } else {
                    utils.error('Unknown vector geometry type.');
                }

                this._isEmpty = false;
            }
        }, {
            key: 'setIndex',
            value: function setIndex(index) {
                this._canvasNode.style.zIndex = index;
            }
        }, {
            key: '_drawArc',
            value: function _drawArc(render) {
                var center = render.center;

                this._ctx.beginPath();
                this._ctx.lineWidth = render.strokeWidth;
                this._ctx.strokeStyle = render.strokeColor;
                this._ctx.fillStyle = render.fillColor;

                if (render.isSector) {
                    this._ctx.moveTo(center[0], center[1]);
                }
                this._ctx.arc(center[0], center[1], render.radius, render.startAngle, render.endAngle, !render.clockwise);
                if (render.isSector) {
                    this._ctx.lineTo(center[0], center[1]);
                }
                this._ctx.fill();
                this._ctx.stroke();
            }
        }, {
            key: '_drawPoint',
            value: function _drawPoint(render) {
                this._ctx.strokeStyle = this._ctx.fillStyle = render.color;
                this._ctx.fillRect(render.coordinates[0], render.coordinates[1], 1, 1);
            }
        }, {
            key: '_drawPoly',
            value: function _drawPoly(render) {
                var coordinates = render.coordinates;

                this._ctx.beginPath();
                this._ctx.lineCap = 'round';
                this._ctx.lineJoin = 'round';
                this._ctx.lineWidth = render.strokeWidth;
                this._ctx.strokeStyle = render.strokeColor;
                this._ctx.setLineDash(render.lineDash || []);

                for (var ring = 0, ringsCount = coordinates.length; ring < ringsCount; ring++) {
                    this._ctx.moveTo(coordinates[ring][0][0], coordinates[ring][0][1]);
                    for (var i = 1, len = coordinates[ring].length; i < len; i++) {
                        this._ctx.lineTo(coordinates[ring][i][0], coordinates[ring][i][1]);
                    }

                    if (render instanceof Polygon) {
                        this._ctx.closePath();
                    }
                }

                if (render instanceof Polygon) {
                    if (render.fillStyle === 'color') {
                        this._ctx.fillStyle = render.fillColor;
                    } else if (render.fillStyle === 'image') {
                        this._ctx.fillStyle = this._ctx.createPattern(render.fillImage, 'repeat');
                        var patternOffsetX = coordinates[0][0][0] % render.fillImage.width,
                            patternOffsetY = coordinates[0][0][1] % render.fillImage.height;
                        this._ctx.translate(patternOffsetX, patternOffsetY);
                    }
                    this._ctx.fill();

                    this._ctx.translate(-patternOffsetX, -patternOffsetY);
                }

                this._ctx.stroke();
            }
        }, {
            key: 'width',
            get: function get() {
                return this._canvasNode.width;
            }
        }, {
            key: 'height',
            get: function get() {
                return this._canvasNode.height;
            }
        }, {
            key: 'isEmpty',
            get: function get() {
                return this._isEmpty;
            }
        }, {
            key: 'node',
            get: function get() {
                return this._canvasNode;
            }
        }]);

        return Canvas;
    }();

    return Canvas;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

sGis.module('painter.domPainter.Container', ['utils'], function (utils) {

    var containerStyle = 'width: 100%; height: 100%; transform-origin: left top; position: absolute;';

    var Container = function () {
        function Container(wrapper, bbox, resolution, onEmpty) {
            _classCallCheck(this, Container);

            this._onEmpty = onEmpty;
            this._bbox = bbox;
            this._resolution = resolution;

            this._setContainer(wrapper);
        }

        _createClass(Container, [{
            key: '_setContainer',
            value: function _setContainer(wrapper) {
                this._container = document.createElement('div');
                this._container.style.cssText = containerStyle;
                wrapper.appendChild(this._container);
            }
        }, {
            key: 'remove',
            value: function remove() {
                this._container.innerHTML = '';
                if (this._container.parentNode) this._container.parentNode.removeChild(this._container);
            }
        }, {
            key: 'updateTransform',
            value: function updateTransform(parentBbox, parentResolution) {
                if (parentBbox.crs !== this._bbox.crs) parentBbox = parentBbox.projectTo(this._bbox.crs);
                this._scale = this._resolution / parentResolution;
                setNodeTransform(this._container, this._scale, (this._bbox.xMin - parentBbox.xMin) / parentResolution, (parentBbox.yMax - this._bbox.yMax) / parentResolution);
            }
        }, {
            key: 'addNode',
            value: function addNode(node, width, height, bbox) {
                if (bbox.crs !== this._bbox.crs) {
                    if (!bbox.crs.canProjectTo(this._bbox.crs)) return;
                    bbox = bbox.projectTo(this._bbox.crs);
                }
                Container._setNodeStyle(node);
                setNodeTransform(node, bbox.width / width / this._resolution, (bbox.xMin - this._bbox.xMin) / this._resolution, (this._bbox.yMax - bbox.yMax) / this._resolution);

                this._container.appendChild(node);
            }
        }, {
            key: 'addFixedSizeNode',
            value: function addFixedSizeNode(node, position) {
                Container._setNodeStyle(node);
                setNodeTransform(node, 1, position[0] - this._bbox.xMin / this._resolution, position[1] + this._bbox.yMax / this._resolution);

                this._container.appendChild(node);
            }
        }, {
            key: 'removeNode',
            value: function removeNode(node) {
                if (node.parentNode === this._container) {
                    this._container.removeChild(node);
                    if (this._container.childElementCount === 0) {
                        this._onEmpty();
                    }
                }
            }
        }, {
            key: 'isEmpty',
            get: function get() {
                return this._container.childElementCount === 0;
            }
        }, {
            key: 'scale',
            get: function get() {
                return this._scale;
            }
        }, {
            key: 'crs',
            get: function get() {
                return this._bbox.crs;
            }
        }], [{
            key: '_setNodeStyle',
            value: function _setNodeStyle(node) {
                node.style.position = 'absolute';
                node.style.transformOrigin = 'left top';
            }
        }]);

        return Container;
    }();

    function setNodeTransform(node, scale, tx, ty) {
        tx = browserAdj(normalize(tx));
        ty = browserAdj(normalize(ty));
        scale = normalize(scale);
        node.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0px) scale(' + scale.toPrecision(6) + ',' + scale.toPrecision(6) + ')';
    }

    function normalize(n) {
        return Math.abs(n - Math.round(n)) < 0.001 ? Math.round(n) : n;
    }

    function browserAdj(n) {
        if (!utils.isIE) {
            return Math.round(n);
        }
        return n;
    }

    return Container;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

sGis.module('painter.DomPainter', ['painter.domPainter.LayerRenderer', 'painter.domPainter.Container', 'painter.domPainter.EventDispatcher', 'Point', 'Bbox', 'utils'], function (LayerRenderer, Container, EventDispatcher, Point, Bbox, utils) {

    'use strict';

    var innerWrapperStyle = 'position: relative; overflow: hidden; width: 100%; height: 100%;';
    var layerWrapperStyle = 'position: absolute; width: 100%; height: 100%; z-index: 0;';

    var DomRenderer = function () {
        function DomRenderer(map, options) {
            _classCallCheck(this, DomRenderer);

            this._map = map;
            utils.init(this, options, true);

            this._layerRenderers = new Map();
            this._containers = [];

            this._position = new Point([Infinity, Infinity]);
            this._resolution = Infinity;

            this._needUpdate = true;
            this._updateAllowed = true;

            this._updateLayerList();
            this._setEventListeners();

            this._repaintBound = this._repaint.bind(this);
            this._repaint();
        }

        _createClass(DomRenderer, [{
            key: 'show',
            value: function show(bbox) {
                var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

                var projected = bbox.projectTo(this.map.crs);
                var xResolution = projected.width / this.width;
                var yResolution = projected.height / this.height;

                var method = animate ? 'animateTo' : 'setPosition';

                this.map[method](projected.center, this.map.getAdjustedResolution(Math.max(xResolution, yResolution)));
            }
        }, {
            key: '_updateLayerList',
            value: function _updateLayerList() {
                var _this = this;

                var mapLayers = this._map.getLayers(true, true);
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this._layerRenderers.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var layer = _step.value;

                        if (mapLayers.indexOf(layer) < 0) this._removeLayer(layer);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                mapLayers.forEach(function (layer, index) {
                    var renderer = _this._layerRenderers.get(layer);
                    if (renderer) {
                        renderer.setIndex(index);
                    } else {
                        _this._addLayer(layer, index);
                    }
                });
            }
        }, {
            key: '_addLayer',
            value: function _addLayer(layer, index) {
                this._layerRenderers.set(layer, new LayerRenderer(this, layer, index));
            }
        }, {
            key: '_removeLayer',
            value: function _removeLayer(layer) {
                this._layerRenderers.get(layer).clear();
                this._layerRenderers.delete(layer);
            }
        }, {
            key: '_setEventListeners',
            value: function _setEventListeners() {
                this._map.on('contentsChange', this._updateLayerList.bind(this));
                this._map.on('drag', this._onMapDrag.bind(this));
                this._map.on('dblclick', this._onMapDblClick.bind(this));
                this._map.on('animationStart', this.forbidUpdate.bind(this));
                this._map.on('animationEnd', this.allowUpdate.bind(this));
            }
        }, {
            key: 'forbidUpdate',
            value: function forbidUpdate() {
                this._updateAllowed = false;
            }
        }, {
            key: 'allowUpdate',
            value: function allowUpdate() {
                this._updateAllowed = true;
            }
        }, {
            key: '_repaint',
            value: function _repaint() {
                var _this2 = this;

                this._updateSize();

                if (this.isDisplayed) {
                    if (this._needUpdate && this._updateAllowed) {
                        this._setNewContainer();
                        this._needUpdate = false;
                    }

                    this._updateBbox();

                    if (this._updateAllowed) {
                        this._map.getLayers(true, true).reverse().forEach(function (layer) {
                            var renderer = _this2._layerRenderers.get(layer);
                            if (_this2._redrawNeeded || renderer.updateNeeded) {
                                renderer.update();
                            }
                        });

                        this._redrawNeeded = false;
                    }
                }

                utils.requestAnimationFrame(this._repaintBound);
            }
        }, {
            key: '_setNewContainer',
            value: function _setNewContainer() {
                this._containers.push(new Container(this._layerWrapper, this.bbox, this._map.resolution, this._removeEmptyContainers.bind(this)));
            }
        }, {
            key: '_removeEmptyContainers',
            value: function _removeEmptyContainers() {
                for (var i = this._containers.length - 2; i >= 0; i--) {
                    if (this._containers[i].isEmpty) {
                        this._removeContainer(i);
                    }
                }
            }
        }, {
            key: '_removeContainer',
            value: function _removeContainer(i) {
                this._containers[i].remove();
                this._containers.splice(i, 1);
            }
        }, {
            key: '_updateSize',
            value: function _updateSize() {
                this._width = this._wrapper ? this._wrapper.clientWidth || this._wrapper.offsetWidth : 0;
                this._height = this._wrapper ? this._wrapper.clientHeight || this._wrapper.offsetHeight : 0;
            }
        }, {
            key: '_updateBbox',
            value: function _updateBbox() {
                var _this3 = this;

                var mapPosition = this._map.position;
                if (this._position[0] !== mapPosition[0] || this._position[1] !== mapPosition[1] || !utils.softEquals(this._map.resolution, this._resolution) || this._bboxWidth !== this._width || this._bboxHeight !== this._height) {
                    this._position = [mapPosition[0], mapPosition[1]];
                    this._resolution = this._map.resolution;

                    var dx = this._width * this._resolution / 2;
                    var dy = this._height * this._resolution / 2;

                    this._bbox = new Bbox([mapPosition[0] - dx, mapPosition[1] - dy], [mapPosition[0] + dx, mapPosition[1] + dy], this._map.crs);

                    this._containers.forEach(function (container) {
                        if (container.crs.canProjectTo(_this3._map.crs)) {
                            container.updateTransform(_this3._bbox, _this3._resolution);
                        } else {
                            _this3._removeContainer(_this3._containers.indexOf(container));
                            if (_this3._containers.length === 0) _this3._setNewContainer();
                        }
                    });

                    if (this._containers.length > 0 && this._containers[this._containers.length - 1].scale !== 1) this._needUpdate = true;

                    this._bboxWidth = this._width;
                    this._bboxHeight = this._height;

                    this._redrawNeeded = true;
                }
            }
        }, {
            key: '_initDOM',
            value: function _initDOM(node) {
                var wrapper = node instanceof HTMLElement ? node : document.getElementById(node);
                if (!wrapper) utils.error('The element with ID "' + node + '" is not found.');

                this._innerWrapper = document.createElement('div');
                this._innerWrapper.style.cssText = innerWrapperStyle;
                wrapper.appendChild(this._innerWrapper);

                this._layerWrapper = document.createElement('div');
                this._layerWrapper.style.cssText = layerWrapperStyle;
                this._innerWrapper.appendChild(this._layerWrapper);

                this._wrapper = wrapper;
            }
        }, {
            key: '_clearDOM',
            value: function _clearDOM() {
                if (this._innerWrapper.parentNode) this._innerWrapper.parentNode.removeChild(this._innerWrapper);
                this._innerWrapper = null;
                this._layerWrapper = null;
                this._wrapper = null;

                this._eventDispatcher.remove();
                this._eventDispatcher = null;
            }
        }, {
            key: 'resolveLayerOverlay',
            value: function resolveLayerOverlay() {
                var _this4 = this;

                var prevContainerIndex = 0;
                this._map.getLayers(true, true).forEach(function (layer) {
                    var renderer = _this4._layerRenderers.get(layer);
                    if (!renderer) return;

                    var containerIndex = _this4._containers.indexOf(renderer.currentContainer);
                    if (containerIndex < prevContainerIndex) {
                        renderer.moveToLastContainer();
                        prevContainerIndex = _this4._containers.length - 1;
                    } else {
                        prevContainerIndex = containerIndex;
                    }
                });

                this._removeEmptyContainers();
            }
        }, {
            key: 'getPointFromPxPosition',
            value: function getPointFromPxPosition(x, y) {
                var resolution = this._map.resolution;
                var bbox = this.bbox;
                return new Point([bbox.xMin + x * resolution, bbox.yMax - y * resolution], bbox.crs);
            }
        }, {
            key: 'getPxPosition',
            value: function getPxPosition(position) {
                return {
                    x: (position[0] - this.bbox.xMin) / this._map.resolution,
                    y: (this.bbox.yMax - position[1]) / this._map.resolution
                };
            }
        }, {
            key: '_onMapDrag',
            value: function _onMapDrag(sGisEvent) {
                var _this5 = this;

                setTimeout(function () {
                    if (sGisEvent.isCanceled()) return;
                    _this5._map.move(sGisEvent.offset.x, sGisEvent.offset.y);
                }, 0);
            }
        }, {
            key: '_onMapDblClick',
            value: function _onMapDblClick(sGisEvent) {
                var _this6 = this;

                setTimeout(function () {
                    if (sGisEvent.isCanceled()) return;
                    _this6._map.animateSetResolution(_this6._map.resolution / 2, sGisEvent.point);
                }, 0);
            }
        }, {
            key: 'wrapper',
            get: function get() {
                return this._wrapper;
            },
            set: function set(node) {
                if (this._wrapper) this._clearDOM();
                if (node) {
                    this._initDOM(node);
                    this._eventDispatcher = new EventDispatcher(this._layerWrapper, this);
                }
            }
        }, {
            key: 'layerRenderers',
            get: function get() {
                return Array.from(this._layerRenderers.values());
            }
        }, {
            key: 'isDisplayed',
            get: function get() {
                return this._width && this._height;
            }
        }, {
            key: 'bbox',
            get: function get() {
                if (!this._bbox) this._updateBbox();
                return this._bbox;
            }
        }, {
            key: 'map',
            get: function get() {
                return this._map;
            }
        }, {
            key: 'currContainer',
            get: function get() {
                return this._containers[this._containers.length - 1];
            }
        }, {
            key: 'width',
            get: function get() {
                return this._width;
            }
        }, {
            key: 'height',
            get: function get() {
                return this._height;
            }
        }, {
            key: 'innerWrapper',
            get: function get() {
                return this._innerWrapper;
            }
        }]);

        return DomRenderer;
    }();

    return DomRenderer;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

sGis.module('painter.domPainter.EventDispatcher', ['event', 'utils'], function (ev, utils) {

    'use strict';

    var MIN_WHEEL_DELAY = 50;

    var defaults = {
        objectEvents: ['click', 'dblclick', 'dragStart', 'mousemove']
    };

    var EventDispatcher = function () {
        function EventDispatcher(baseNode, master) {
            _classCallCheck(this, EventDispatcher);

            this._master = master;
            this._setListeners(baseNode);

            this._onDocumentMousemove = this._onDocumentMousemove.bind(this);
            this._onDocumentMouseup = this._onDocumentMouseup.bind(this);

            this._wheelTimer = 0;
            this._touchHandler = { dragPrevPosition: {} };
        }

        _createClass(EventDispatcher, [{
            key: '_dispatchEvent',
            value: function _dispatchEvent(name, data) {
                var sGisEvent;

                var topObject = this._master.map;
                if (data.position) {
                    var layerRenderers = this._master.layerRenderers;
                    for (var i = layerRenderers.length - 1; i >= 0; i--) {
                        var details = {};
                        var targetObject = layerRenderers[i].getEventCatcher(name, [data.position.x, data.position.y], details);
                        if (targetObject) {
                            data.intersectionType = details.intersectionType;
                            sGisEvent = targetObject.fire(name, data);
                            topObject = targetObject;
                            if (sGisEvent && sGisEvent.isCanceled()) return sGisEvent;
                            break;
                        }
                    }
                }

                if (name === 'mousemove' && topObject !== this._hoverObject) {
                    if (this._hoverObject && this._hoverObject !== this._master.map) {
                        this._hoverObject.fire('mouseout', data);
                    }

                    topObject.fire('mouseover', data);
                    this._hoverObject = topObject;
                }

                if (sGisEvent) {
                    this._master.map.forwardEvent(sGisEvent);
                    return sGisEvent;
                } else {
                    return this._master.map.fire(name, data);
                }
            }
        }, {
            key: '_setListeners',
            value: function _setListeners(baseNode) {
                ev.add(baseNode, 'mousedown', this._onmousedown.bind(this));
                ev.add(baseNode, 'wheel', this._onwheel.bind(this));
                ev.add(baseNode, 'click', this._onclick.bind(this));
                ev.add(baseNode, 'dblclick', this._ondblclick.bind(this));
                ev.add(baseNode, 'mousemove', this._onmousemove.bind(this));
                ev.add(baseNode, 'mouseout', this._onmouseout.bind(this));
                ev.add(baseNode, 'contextmenu', this._oncontextmenu.bind(this));

                ev.add(baseNode, 'touchstart', this._ontouchstart.bind(this));
                ev.add(baseNode, 'touchmove', this._ontouchmove.bind(this));
                ev.add(baseNode, 'touchend', this._ontouchend.bind(this));
            }
        }, {
            key: '_onmousedown',
            value: function _onmousedown(event) {
                if (!isFormElement(event.target)) {
                    this._clickCatcher = true;
                    if (event.which === 1) {
                        this._dragPosition = ev.getMouseOffset(event.currentTarget, event);

                        ev.add(document, 'mousemove', this._onDocumentMousemove);
                        ev.add(document, 'mouseup', this._onDocumentMouseup);

                        document.ondragstart = function () {
                            return false;
                        };
                        document.body.onselectstart = function () {
                            return false;
                        };
                    }
                    return false;
                }
            }
        }, {
            key: '_onDocumentMousemove',
            value: function _onDocumentMousemove(event) {
                var map = this._master.map;
                var mousePosition = ev.getMouseOffset(this._master.wrapper, event);
                var dxPx = this._dragPosition.x - mousePosition.x;
                var dyPx = this._dragPosition.y - mousePosition.y;
                var resolution = map.resolution;
                var point = this._master.getPointFromPxPosition(mousePosition.x, mousePosition.y);
                var position = { x: point.x / resolution, y: -point.y / resolution };

                if (Math.abs(dxPx) > 2 || Math.abs(dyPx) > 2 || !this._clickCatcher) {
                    this._lastDrag = { x: dxPx * resolution, y: -dyPx * resolution };

                    if (this._clickCatcher) {
                        this._clickCatcher = null;
                        var originalPoint = this._master.getPointFromPxPosition(this._dragPosition.x, this._dragPosition.y);
                        var originalPosition = { x: originalPoint.x / resolution, y: -originalPoint.y / resolution };
                        var sGisEvent = this._dispatchEvent('dragStart', { map: map, mouseOffset: mousePosition, position: originalPosition, point: originalPoint, ctrlKey: event.ctrlKey, offset: { xPx: dxPx, yPx: dyPx, x: this._lastDrag.x, y: this._lastDrag.y }, browserEvent: event });
                        this._draggingObject = sGisEvent.draggingObject || this._master.map;
                    }

                    this._dragPosition = mousePosition;
                    this._draggingObject.fire('drag', { map: map, mouseOffset: mousePosition, position: position, point: point, ctrlKey: event.ctrlKey, offset: { xPx: dxPx, yPx: dyPx, x: this._lastDrag.x, y: this._lastDrag.y }, browserEvent: event });
                }
            }
        }, {
            key: '_onDocumentMouseup',
            value: function _onDocumentMouseup(event) {
                this._clearDocumentListeners();
                if (this._draggingObject) this._draggingObject.fire('dragEnd', { browserEvent: event });

                this._draggingObject = null;
                this._lastDrag = null;
            }
        }, {
            key: 'remove',
            value: function remove() {
                this._clearDocumentListeners();
            }
        }, {
            key: '_clearDocumentListeners',
            value: function _clearDocumentListeners() {
                ev.remove(document, 'mousemove', this._onDocumentMousemove);
                ev.remove(document, 'mouseup', this._onDocumentMouseup);
                document.ondragstart = null;
                document.body.onselectstart = null;
            }
        }, {
            key: '_onwheel',
            value: function _onwheel(event) {
                var time = Date.now();
                if (time - this._wheelTimer > MIN_WHEEL_DELAY) {
                    this._wheelTimer = time;
                    var map = this._master.map;
                    var wheelDirection = ev.getWheelDirection(event);
                    var mouseOffset = ev.getMouseOffset(event.currentTarget, event);

                    map.zoom(wheelDirection, this._master.getPointFromPxPosition(mouseOffset.x, mouseOffset.y));
                }
                event.preventDefault();
                return false;
            }
        }, {
            key: '_getMouseEventDescription',
            value: function _getMouseEventDescription(event) {
                var map = this._master.map;
                var mouseOffset = ev.getMouseOffset(event.currentTarget, event);
                var point = this._master.getPointFromPxPosition(mouseOffset.x, mouseOffset.y);
                var position = { x: point.x / map.resolution, y: -point.y / map.resolution };
                return { map: map, mouseOffset: mouseOffset, ctrlKey: event.ctrlKey, point: point, position: position, browserEvent: event };
            }
        }, {
            key: '_onclick',
            value: function _onclick(event) {
                if (this._clickCatcher && !isFormElement(event.target)) {
                    this._dispatchEvent('click', this._getMouseEventDescription(event));
                }
            }
        }, {
            key: '_ondblclick',
            value: function _ondblclick(event) {
                if (!isFormElement(event.target)) {
                    this._clickCatcher = null;
                    this._dispatchEvent('dblclick', this._getMouseEventDescription(event));
                }
            }
        }, {
            key: '_onmousemove',
            value: function _onmousemove(event) {
                this._dispatchEvent('mousemove', this._getMouseEventDescription(event));
            }
        }, {
            key: '_onmouseout',
            value: function _onmouseout(event) {
                this._dispatchEvent('mouseout', this._getMouseEventDescription(event));
            }
        }, {
            key: '_oncontextmenu',
            value: function _oncontextmenu(event) {
                this._dispatchEvent('contextmenu', this._getMouseEventDescription(event));
            }
        }, {
            key: '_ontouchstart',
            value: function _ontouchstart(event) {
                for (var i = 0; i < event.changedTouches.length; i++) {
                    var touch = event.changedTouches[i];
                    this._touchHandler.dragPrevPosition[touch.identifier] = { x: touch.pageX, y: touch.pageY };
                    this._touchHandler.lastDrag = { x: 0, y: 0 };
                }
            }
        }, {
            key: '_ontouchmove',
            value: function _ontouchmove(event) {
                var map = this._master.map;
                if (event.touches.length === 1 && this._touchHandler.lastDrag) {
                    var touch = event.targetTouches[0];
                    var dxPx = this._touchHandler.dragPrevPosition[touch.identifier].x - touch.pageX;
                    var dyPx = this._touchHandler.dragPrevPosition[touch.identifier].y - touch.pageY;
                    var resolution = map.resolution;
                    var touchOffset = ev.getMouseOffset(event.currentTarget, touch);
                    var point = this._master.getPointFromPxPosition(touchOffset.x, touchOffset.y);
                    var position = { x: point.x / resolution, y: 0 - point.y / resolution };

                    if (this._touchHandler.lastDrag.x === 0 && this._touchHandler.lastDrag.y === 0) {
                        var sGisEvent = this._dispatchEvent('dragStart', { point: point, position: position, offset: { xPx: dxPx, yPx: dyPx, x: this._touchHandler.lastDrag.x, y: this._touchHandler.lastDrag.y } });
                        this._draggingObject = sGisEvent.draggingObject || map;
                    }

                    this._touchHandler.lastDrag = { x: dxPx * resolution, y: 0 - dyPx * resolution };
                    this._draggingObject.fire('drag', { point: point, position: position, offset: { xPx: dxPx, yPx: dyPx, x: this._touchHandler.lastDrag.x, y: this._touchHandler.lastDrag.y } });

                    this._touchHandler.dragPrevPosition[touch.identifier].x = touch.pageX;
                    this._touchHandler.dragPrevPosition[touch.identifier].y = touch.pageY;
                } else if (event.touches.length > 1) {
                    this._master.forbidUpdate();
                    this._touchHandler.lastDrag = null;
                    this._touchHandler.scaleChanged = true;

                    var touch1 = event.touches[0];
                    var touch2 = event.touches[1];

                    touch1.prevPosition = this._touchHandler.dragPrevPosition[touch1.identifier];
                    touch2.prevPosition = this._touchHandler.dragPrevPosition[touch2.identifier];

                    var x11 = touch1.prevPosition.x;
                    var x12 = touch1.pageX;
                    var x21 = touch2.prevPosition.x;
                    var x22 = touch2.pageX;
                    var baseX = x11 - x12 - x21 + x22 === 0 ? (x11 + x21) / 2 : (x11 * x22 - x12 * x21) / (x11 - x12 - x21 + x22);
                    var y11 = touch1.prevPosition.y;
                    var y12 = touch1.pageY;
                    var y21 = touch2.prevPosition.y;
                    var y22 = touch2.pageY;
                    var baseY = y11 - y12 - y21 + y22 === 0 ? (y11 + y21) / 2 : (y11 * y22 - y12 * y21) / (y11 - y12 - y21 + y22);
                    var len1 = Math.sqrt(Math.pow(x11 - x21, 2) + Math.pow(y11 - y21, 2));
                    var len2 = Math.sqrt(Math.pow(x12 - x22, 2) + Math.pow(y12 - y22, 2));

                    map.changeScale(len1 / len2, this._master.getPointFromPxPosition(baseX, baseY), true);

                    this._touchHandler.dragPrevPosition[touch1.identifier].x = touch1.pageX;
                    this._touchHandler.dragPrevPosition[touch1.identifier].y = touch1.pageY;
                    this._touchHandler.dragPrevPosition[touch2.identifier].x = touch2.pageX;
                    this._touchHandler.dragPrevPosition[touch2.identifier].y = touch2.pageY;
                }
                event.preventDefault();
            }
        }, {
            key: '_ontouchend',
            value: function _ontouchend(event) {
                for (var i = 0; i < event.changedTouches.length; i++) {
                    delete this._touchHandler.dragPrevPosition[event.changedTouches[i].identifier];
                }

                this._touchHandler.lastDrag = null;

                var map = this._master.map;
                if (this._touchHandler.scaleChanged) {
                    map.adjustResolution();
                    this._touchHandler.scaleChanged = false;
                    this._master.allowUpdate();
                } else {
                    if (this._draggingObject) {
                        this._draggingObject.fire('dragEnd');
                        this._draggingObject = null;
                    }
                }
            }
        }]);

        return EventDispatcher;
    }();

    function isFormElement(e) {
        var formElements = ['BUTTON', 'INPUT', 'LABEL', 'OPTION', 'SELECT', 'TEXTAREA'];
        for (var i = 0; i < formElements.length; i++) {
            if (e.tagName === formElements[i]) return true;
        }
        return false;
    }

    utils.extend(EventDispatcher.prototype, defaults);

    return EventDispatcher;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

sGis.module('painter.domPainter.LayerRenderer', ['Bbox', 'painter.domPainter.Canvas', 'painter.domPainter.SvgRender', 'utils'], function (Bbox, Canvas, SvgRender, utils) {

    'use strict';

    var defaults = {
        delayedUpdateTime: 500,

        listensFor: ['click', 'dblclick', 'dragStart', 'mousemove']
    };

    var LayerRenderer = function () {
        function LayerRenderer(master, layer, index) {
            var useCanvas = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

            _classCallCheck(this, LayerRenderer);

            this._master = master;
            this._layer = layer;
            this._useCanvas = useCanvas;
            this._canvas = new Canvas();

            this._bbox = new Bbox([Infinity, Infinity], [Infinity, Infinity]);
            this._featureRenders = new Map();
            this._loadingRenders = new Map();
            this._renderNodeMap = new Map();
            this._renderContainerMap = new Map();

            this._outdatedFeatureRenders = new Map();
            this._rendersForRemoval = new Map();

            this._setEventCatcherMaps();

            this._setListeners();
            this.setIndex(index);

            this._forceUpdate();
        }

        _createClass(LayerRenderer, [{
            key: '_setListeners',
            value: function _setListeners() {
                var _this = this;

                this._layer.on('propertyChange', function () {
                    _this._forceUpdate();
                });
            }
        }, {
            key: '_setEventCatcherMaps',
            value: function _setEventCatcherMaps() {
                var _this2 = this;

                this._eventCatchers = {};
                this.listensFor.forEach(function (eventName) {
                    _this2._eventCatchers[eventName] = new Map();
                });
            }
        }, {
            key: '_forceUpdate',
            value: function _forceUpdate() {
                this.updateNeeded = true;
            }
        }, {
            key: 'setIndex',
            value: function setIndex(index) {
                var _this3 = this;

                if (index === this._index) return;

                var zIndex = index * 2 + 1;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this._featureRenders.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var renders = _step.value;

                        renders.forEach(function (render) {
                            var node = _this3._renderNodeMap.get(render);
                            if (node) node.style.zIndex = zIndex;
                        });
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this._outdatedFeatureRenders.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var _renders = _step2.value;

                        _renders.forEach(function (render) {
                            var node = _this3._renderNodeMap.get(render);
                            if (node) node.style.zIndex = zIndex;
                        });
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                this._canvas.setIndex(index * 2);

                this._index = index;
                this._zIndex = zIndex;
            }
        }, {
            key: 'clear',
            value: function clear() {
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = this._loadingRenders.keys()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var render = _step3.value;

                        this._removeRender(render);
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }

                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = this._outdatedFeatureRenders.keys()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var feature = _step4.value;

                        this._clean(feature);
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }

                var _iteratorNormalCompletion5 = true;
                var _didIteratorError5 = false;
                var _iteratorError5 = undefined;

                try {
                    for (var _iterator5 = this._featureRenders.keys()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                        var _feature = _step5.value;

                        this._removeRenders(_feature);
                    }
                } catch (err) {
                    _didIteratorError5 = true;
                    _iteratorError5 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion5 && _iterator5.return) {
                            _iterator5.return();
                        }
                    } finally {
                        if (_didIteratorError5) {
                            throw _iteratorError5;
                        }
                    }
                }

                var _iteratorNormalCompletion6 = true;
                var _didIteratorError6 = false;
                var _iteratorError6 = undefined;

                try {
                    for (var _iterator6 = this._renderNodeMap.keys()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                        var _render = _step6.value;

                        this._removeRender(_render);
                    }
                } catch (err) {
                    _didIteratorError6 = true;
                    _iteratorError6 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion6 && _iterator6.return) {
                            _iterator6.return();
                        }
                    } finally {
                        if (_didIteratorError6) {
                            throw _iteratorError6;
                        }
                    }
                }

                if (this._canvasContainer) this._canvasContainer.removeNode(this._canvas.node);
            }
        }, {
            key: 'update',
            value: function update() {
                var _this4 = this;

                if (this._layer.delayedUpdate) {
                    if (this._updateTimer) clearTimeout(this._updateTimer);

                    if (this.updateNeeded) {
                        this._rerender();
                    } else {
                        this._updateTimer = setTimeout(function () {
                            _this4._rerender();
                        }, this.delayedUpdateTime);
                    }
                } else {
                    this._rerender();
                }

                this.updateNeeded = false;
            }
        }, {
            key: '_rerender',
            value: function _rerender() {
                var _this5 = this;

                var bbox = this._master.bbox;
                var newFeatures = this._layer.getFeatures(bbox, this._master.map.resolution);

                var _iteratorNormalCompletion7 = true;
                var _didIteratorError7 = false;
                var _iteratorError7 = undefined;

                try {
                    for (var _iterator7 = this._featureRenders.keys()[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                        var feature = _step7.value;

                        if (newFeatures.indexOf(feature) < 0) this._markForRemoval(feature);
                    }
                } catch (err) {
                    _didIteratorError7 = true;
                    _iteratorError7 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion7 && _iterator7.return) {
                            _iterator7.return();
                        }
                    } finally {
                        if (_didIteratorError7) {
                            throw _iteratorError7;
                        }
                    }
                }

                this._bbox = bbox;
                this._resetCanvas(bbox);

                newFeatures.forEach(function (feature) {
                    _this5._draw(feature);
                });

                if (this._canvas.isEmpty) {
                    if (this._canvasContainer) this._canvasContainer.removeNode(this._canvas.node);
                    this._canvasContainer = null;
                } else {
                    if (this._canvasContainer) this._canvasContainer.removeNode(this._canvas.node);
                    this._master.currContainer.addNode(this._canvas.node, this._master.width, this._master.height, this._bbox);
                    this.currentContainer = this._master.currContainer;
                    this._canvasContainer = this._master.currContainer;
                }

                this._clean();
            }
        }, {
            key: '_resetCanvas',
            value: function _resetCanvas(bbox) {
                this._canvas.reset(bbox, this._master.map.resolution, this._master.width, this._master.height);
            }
        }, {
            key: '_featureIsLoading',
            value: function _featureIsLoading(feature) {
                var renders = this._featureRenders.get(feature);
                if (!renders) return false;

                for (var i = 0; i < renders.length; i++) {
                    if (this._loadingRenders.has(renders[i])) return true;
                }

                return false;
            }
        }, {
            key: '_draw',
            value: function _draw(feature) {
                if (this._featureIsLoading(feature)) return;
                this._removeForRemoval(feature);

                var renders = feature.render(this._master.map.resolution, this._master.map.crs);

                var isMixedRender = false;
                var canvasIsUsed = this._useCanvas && renders[0] && renders[0].isVector;
                for (var i = 1; i < renders.length; i++) {
                    if (this._useCanvas && renders[i] && renders[i].isVector) canvasIsUsed = true;
                    if (renders[i].isVector !== renders[i - 1].isVector) {
                        isMixedRender = true;
                        break;
                    }
                }
                if (isMixedRender) canvasIsUsed = false;

                var prevRenders = this._featureRenders.get(feature);
                if (!canvasIsUsed && prevRenders === renders) return;

                if (prevRenders !== renders) this._markAsOutdated(feature);
                this._featureRenders.set(feature, renders);

                for (var _i = 0; _i < renders.length; _i++) {
                    if (renders[_i].isVector) {
                        if (this._useCanvas && !isMixedRender) {
                            this._canvas.draw(renders[_i]);
                        } else {
                            this._drawNodeRender(renders[_i], feature);
                        }
                    } else {
                        this._drawNodeRender(renders[_i], feature);
                    }
                    this._setFeatureListeners(feature, renders[_i]);
                }

                if (canvasIsUsed || renders.length === 0) this._clean(feature);
            }
        }, {
            key: '_setFeatureListeners',
            value: function _setFeatureListeners(feature, render) {
                var _this6 = this;

                this.listensFor.forEach(function (eventName) {
                    if (!feature.hasListeners(eventName) || render.ignoreEvents) return;

                    _this6._eventCatchers[eventName].set(render, feature);
                });
            }
        }, {
            key: '_drawNodeRender',
            value: function _drawNodeRender(render, feature) {
                var _this7 = this;

                if (this._loadingRenders.has(render)) return;

                this._loadingRenders.set(render, 1);

                var callback = function callback(error, node) {
                    _this7._loadingRenders.delete(render);
                    if (error || !_this7._featureRenders.has(feature) || !render.baseRender && _this7._featureRenders.get(feature).indexOf(render) < 0 || render.baseRender && _this7._featureRenders.get(feature).indexOf(render.baseRender) < 0 || _this7._outdatedFeatureRenders.has(render) || _this7._rendersForRemoval.has(render)) return;

                    node.style.zIndex = _this7._zIndex;

                    var container = _this7._master.currContainer;
                    if (render.bbox) {
                        container.addNode(node, render.width || node.width, render.height || node.height, render.bbox);
                    } else if (render.position || svgRender.position) {
                        container.addFixedSizeNode(node, render.position || svgRender.position);
                    }

                    _this7._renderNodeMap.set(render, node);

                    _this7._renderContainerMap.set(render, container);
                    _this7.currentContainer = container;

                    if (render.onAfterDisplayed) render.onAfterDisplayed(node);

                    _this7._clean(feature);
                };

                if (render.getNode) {
                    render.getNode(callback);
                } else {
                    var svgRender = new SvgRender(render);
                    svgRender.getNode(callback);
                }
            }
        }, {
            key: '_clean',
            value: function _clean(feature) {
                var _this8 = this;

                var outdated = this._outdatedFeatureRenders.get(feature);
                if (outdated) {
                    outdated.forEach(function (render) {
                        _this8._removeRender(render);
                    });

                    this._outdatedFeatureRenders.delete(feature);
                }

                if (this._loadingRenders.size > 0) return;

                setTimeout(function () {
                    var _iteratorNormalCompletion8 = true;
                    var _didIteratorError8 = false;
                    var _iteratorError8 = undefined;

                    try {
                        for (var _iterator8 = _this8._rendersForRemoval.values()[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                            var renders = _step8.value;

                            renders.forEach(function (render) {
                                _this8._removeRender(render);
                            });
                        }
                    } catch (err) {
                        _didIteratorError8 = true;
                        _iteratorError8 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion8 && _iterator8.return) {
                                _iterator8.return();
                            }
                        } finally {
                            if (_didIteratorError8) {
                                throw _iteratorError8;
                            }
                        }
                    }

                    _this8._rendersForRemoval.clear();
                }, this._layer.transitionTime || 0);
            }
        }, {
            key: '_markForRemoval',
            value: function _markForRemoval(feature) {
                var forRemoval = this._rendersForRemoval.get(feature) || [];

                var renders = this._featureRenders.get(feature);
                renders.forEach(function (render) {
                    forRemoval.push(render);
                });

                this._rendersForRemoval.set(feature, forRemoval);
                this._featureRenders.delete(feature);
            }
        }, {
            key: '_removeForRemoval',
            value: function _removeForRemoval(feature) {
                var _this9 = this;

                var renders = this._rendersForRemoval.get(feature);
                if (renders && !this._featureRenders.has(feature)) {
                    renders.forEach(function (render) {
                        _this9._removeRender(render);
                    });
                }
            }
        }, {
            key: '_markAsOutdated',
            value: function _markAsOutdated(feature) {
                var renders = this._featureRenders.get(feature);
                if (!renders) return;

                var outdated = this._outdatedFeatureRenders.get(feature) || [];
                renders.forEach(function (render) {
                    outdated.push(render);
                });

                this._outdatedFeatureRenders.set(feature, outdated);
                this._featureRenders.delete(feature);
            }
        }, {
            key: '_removeRenders',
            value: function _removeRenders(feature) {
                var _this10 = this;

                var renders = this._featureRenders.get(feature);

                if (renders) {
                    renders.forEach(function (render) {
                        _this10._removeRender(render);
                    });
                    this._featureRenders.delete(feature);
                }

                var outdated = this._outdatedFeatureRenders.get(feature);
                if (outdated) {
                    outdated.forEach(function (render) {
                        _this10._removeRender(render);
                    });
                    this._outdatedFeatureRenders.delete(feature);
                }
            }
        }, {
            key: '_removeRender',
            value: function _removeRender(render) {
                var _this11 = this;

                this.listensFor.forEach(function (eventName) {
                    _this11._eventCatchers[eventName].delete(render);
                });

                var node = this._renderNodeMap.get(render);
                if (node === undefined) return;

                var container = this._renderContainerMap.get(render);
                if (container) {
                    if (node) container.removeNode(node);
                    this._renderContainerMap.delete(render);
                }

                this._renderNodeMap.delete(render);
            }
        }, {
            key: 'moveToLastContainer',
            value: function moveToLastContainer() {
                var _iteratorNormalCompletion9 = true;
                var _didIteratorError9 = false;
                var _iteratorError9 = undefined;

                try {
                    for (var _iterator9 = this._outdatedFeatureRenders.values()[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                        var renders = _step9.value;

                        this._moveRendersToLastContainer(renders);
                    }
                } catch (err) {
                    _didIteratorError9 = true;
                    _iteratorError9 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion9 && _iterator9.return) {
                            _iterator9.return();
                        }
                    } finally {
                        if (_didIteratorError9) {
                            throw _iteratorError9;
                        }
                    }
                }

                var _iteratorNormalCompletion10 = true;
                var _didIteratorError10 = false;
                var _iteratorError10 = undefined;

                try {
                    for (var _iterator10 = this._featureRenders.values()[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                        var _renders2 = _step10.value;

                        this._moveRendersToLastContainer(_renders2);
                    }
                } catch (err) {
                    _didIteratorError10 = true;
                    _iteratorError10 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion10 && _iterator10.return) {
                            _iterator10.return();
                        }
                    } finally {
                        if (_didIteratorError10) {
                            throw _iteratorError10;
                        }
                    }
                }

                if (this._canvas.node.parentNode) {
                    this._master.currContainer.addNode(this._canvas.node, this._canvas.width, this._canvas.height, this._bbox);
                    this._canvasContainer = this._master.currContainer;
                }
            }
        }, {
            key: '_moveRendersToLastContainer',
            value: function _moveRendersToLastContainer(renders) {
                var _this12 = this;

                var lastContainer = this._master.currContainer;
                renders.forEach(function (render) {
                    var node = _this12._renderNodeMap.get(render);
                    var container = _this12._renderContainerMap.get(render);
                    if (node && container) {
                        if (container !== lastContainer) {
                            if (render.bbox) {
                                lastContainer.addNode(node, render.width || node.width, render.height || node.height, render.bbox);
                            } else if (render.position) {
                                lastContainer.addFixedSizeNode(node, render.position);
                            }
                            _this12._renderContainerMap.set(render, lastContainer);
                        }
                    }
                });
            }
        }, {
            key: 'getEventCatcher',
            value: function getEventCatcher(eventName, pxPosition, data) {
                if (!this._eventCatchers[eventName]) return;

                var _iteratorNormalCompletion11 = true;
                var _didIteratorError11 = false;
                var _iteratorError11 = undefined;

                try {
                    for (var _iterator11 = this._eventCatchers[eventName].keys()[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                        var render = _step11.value;

                        var intersectionType = render.contains && render.contains(pxPosition);
                        if (intersectionType) {
                            data.intersectionType = intersectionType;
                            return this._eventCatchers[eventName].get(render);
                        }
                    }
                } catch (err) {
                    _didIteratorError11 = true;
                    _iteratorError11 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion11 && _iterator11.return) {
                            _iterator11.return();
                        }
                    } finally {
                        if (_didIteratorError11) {
                            throw _iteratorError11;
                        }
                    }
                }
            }
        }, {
            key: 'layer',
            get: function get() {
                return this._layer;
            }
        }, {
            key: 'currentContainer',
            get: function get() {
                return this._currentContainer;
            },
            set: function set(container) {
                if (this._currentContainer !== container) {
                    this._currentContainer = container;
                    this._master.resolveLayerOverlay();
                }
            }
        }]);

        return LayerRenderer;
    }();

    utils.extend(LayerRenderer.prototype, defaults);

    return LayerRenderer;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

sGis.module('painter.domPainter.SvgRender', ['render.Arc', 'render.Point', 'render.Polyline', 'render.Polygon', 'utils.Color', 'utils'], function (Arc, Point, Polyline, Polygon, Color, utils) {

    'use strict';

    var NS = 'http://www.w3.org/2000/svg';

    var SvgRender = function () {
        function SvgRender(render) {
            _classCallCheck(this, SvgRender);

            this._baseRender = render;
        }

        _createClass(SvgRender, [{
            key: 'getNode',
            value: function getNode(callback) {
                if (!this._node) this._setNode();
                callback(null, this._node);
            }
        }, {
            key: '_setNode',
            value: function _setNode() {
                if (this._baseRender instanceof Arc) {
                    if (this._baseRender.startAngle == 0 || this._baseRender.endAngle == 2 * Math.PI) {
                        this._setArcNode();
                    } else {
                        this._setSegmentNode();
                    }
                } else if (this._baseRender instanceof Polygon) {
                    this._setPolygonNode();
                } else if (this._baseRender instanceof Polyline) {
                    this._setPolylineNode();
                }
            }
        }, {
            key: '_setPolygonNode',
            value: function _setPolygonNode() {
                var path = this._getSvgPath();
                path.d += ' Z';
                path.d = path.d.replace(/ M/g, ' Z M');

                this._node = this._getPathNode({
                    stroke: this._baseRender.strokeColor,
                    'stroke-dasharray': this._baseRender.lineDash && this._baseRender.lineDash.length > 0 ? this._baseRender.lineDash.join(',') : undefined,
                    'stroke-width': this._baseRender.strokeWidth,
                    fill: this._baseRender.fillStyle === 'color' ? this._baseRender.fillColor : undefined,
                    fillImage: this._baseRender.fillStyle === 'image' ? this._baseRender.fillImage : undefined,
                    width: path.width,
                    height: path.height,
                    x: path.x,
                    y: path.y,
                    viewBox: [path.x, path.y, path.width, path.height].join(' '),
                    d: path.d
                });

                this._position = [path.x, path.y];
            }
        }, {
            key: '_setPolylineNode',
            value: function _setPolylineNode() {
                var path = this._getSvgPath();
                this._node = this._getPathNode({
                    stroke: this._baseRender.strokeColor,
                    'stroke-dasharray': this._baseRender.lineDash && this._baseRender.lineDash.length > 0 ? this._baseRender.lineDash.join(',') : undefined,
                    'stroke-width': this._baseRender.strokeWidth,
                    fill: 'transparent',
                    width: path.width,
                    height: path.height,
                    x: path.x,
                    y: path.y,
                    viewBox: [path.x, path.y, path.width, path.height].join(' '),
                    d: path.d
                });

                this._position = [path.x, path.y];
            }
        }, {
            key: '_getPathNode',
            value: function _getPathNode(properties) {
                if (properties.fillImage) {
                    var defs = document.createElementNS(NS, 'defs');
                    var pattern = document.createElementNS(NS, 'pattern');
                    var id = utils.getGuid();
                    pattern.setAttribute('id', id);
                    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
                    pattern.setAttribute('x', properties.x);
                    pattern.setAttribute('y', properties.y);
                    pattern.setAttribute('width', properties.fillImage.width);
                    pattern.setAttribute('height', properties.fillImage.height);

                    var image = document.createElementNS(NS, 'image');
                    image.setAttributeNS("http://www.w3.org/1999/xlink", 'xlink:href', properties.fillImage.src);
                    image.setAttribute('width', properties.fillImage.width);
                    image.setAttribute('height', properties.fillImage.height);

                    pattern.appendChild(image);
                    defs.appendChild(pattern);
                }

                var path = document.createElementNS(NS, 'path');
                var svgAttributes = setAttributes(path, properties);
                var svg = this._getSvgBase(svgAttributes);

                if (properties.fillImage) {
                    svg.setAttribute('xmlns', NS);
                    svg.setAttribute('xmlns:xlink', "http://www.w3.org/1999/xlink");

                    path.setAttribute('fill', 'url(#' + id + ')');
                    svg.appendChild(defs);
                }

                svg.appendChild(path);

                return svg;
            }
        }, {
            key: '_setSegmentNode',
            value: function _setSegmentNode() {
                var path = this._getSegment();
                this._node = this._getPathNode({
                    stroke: this._baseRender.strokeColor,
                    'stroke-width': this._baseRender.strokeWidth,
                    fill: this._baseRender.fillColor,
                    width: path.width,
                    height: path.height,
                    x: path.x,
                    y: path.y,
                    viewBox: [path.x, path.y, path.width, path.height].join(' '),
                    d: path.d
                });

                this._position = [path.x, path.y];
            }
        }, {
            key: '_getSegment',
            value: function _getSegment() {
                var r = this._baseRender.radius;
                var r2 = r * 2 + this._baseRender.strokeWidth;
                var x = this._baseRender.center[0];
                var y = this._baseRender.center[1];

                var x1 = x + r * Math.cos(this._baseRender.startAngle);
                var y1 = y + r * Math.sin(this._baseRender.startAngle);

                var x2 = x + r * Math.cos(this._baseRender.endAngle);
                var y2 = y + r * Math.sin(this._baseRender.endAngle);

                var largeFlag = Math.abs(this._baseRender.endAngle - this._baseRender.startAngle) % (Math.PI * 2) > Math.PI ? 1 : 0;

                var path = 'M ' + x + ',' + y + ' L ' + x1 + ',' + y1 + ' A ' + r + ',' + r + ' 0 ' + largeFlag + ' 1 ' + x2 + ',' + y2;
                var x0 = x - r - this._baseRender.strokeWidth / 2;
                var y0 = y - r - this._baseRender.strokeWidth / 2;

                return { x: x0, y: y0, width: r2, height: r2, d: path };
            }
        }, {
            key: '_setArcNode',
            value: function _setArcNode() {
                var r2 = this._baseRender.radius * 2 + this._baseRender.strokeWidth;
                var x = this._baseRender.center[0] - this._baseRender.radius - this._baseRender.strokeWidth / 2;
                var y = this._baseRender.center[1] - this._baseRender.radius - this._baseRender.strokeWidth / 2;

                this._node = this._getCircle({
                    r: this._baseRender.radius,
                    cx: this._baseRender.center[0],
                    cy: this._baseRender.center[1],
                    stroke: this._baseRender.strokeColor,
                    'stroke-width': this._baseRender.strokeWidth,
                    fill: this._baseRender.fillColor,

                    width: r2,
                    height: r2,
                    viewBox: [x, y, r2, r2].join(' ')
                });

                this._position = [x, y];
            }
        }, {
            key: '_getCircle',
            value: function _getCircle(properties) {
                var circle = document.createElementNS(NS, 'circle');
                var svgAttributes = setAttributes(circle, properties);
                var svg = this._getSvgBase(svgAttributes);

                svg.appendChild(circle);

                return svg;
            }
        }, {
            key: '_getSvgBase',
            value: function _getSvgBase(properties) {
                var svg = document.createElementNS(NS, 'svg');
                setAttributes(svg, properties);
                svg.setAttribute('style', 'pointerEvents: none;');

                return svg;
            }
        }, {
            key: '_getSvgPath',
            value: function _getSvgPath() {
                var d = '';
                var coordinates = this._baseRender.coordinates;
                var x = coordinates[0][0][0];
                var y = coordinates[0][0][1];
                var xMax = x;
                var yMax = y;

                for (var ring = 0; ring < coordinates.length; ring++) {
                    d += 'M' + coordinates[ring][0].join(' ') + ' ';
                    for (var i = 1; i < coordinates[ring].length; i++) {
                        d += 'L' + coordinates[ring][i].join(' ') + ' ';
                        x = Math.min(x, coordinates[ring][i][0]);
                        y = Math.min(y, coordinates[ring][i][1]);
                        xMax = Math.max(xMax, coordinates[ring][i][0]);
                        yMax = Math.max(yMax, coordinates[ring][i][1]);
                    }
                }

                var width = xMax - x + this._baseRender.strokeWidth;
                var height = yMax - y + this._baseRender.strokeWidth;
                x -= this._baseRender.strokeWidth / 2;
                y -= this._baseRender.strokeWidth / 2;
                d = d.trim();

                return { width: width, height: height, x: x, y: y, d: d };
            }
        }, {
            key: 'baseRender',
            get: function get() {
                return this._baseRender;
            }
        }, {
            key: 'position',
            get: function get() {
                return this._position;
            }
        }]);

        return SvgRender;
    }();

    var svgAttributes = ['width', 'height', 'viewBox'];
    function setAttributes(element, attributes) {
        var isSvg = element instanceof SVGSVGElement;
        var notSet = {};
        for (var i in attributes) {
            if (attributes.hasOwnProperty(i) && i !== 'fillImage' && attributes[i] !== undefined) {
                if (!isSvg && svgAttributes.indexOf(i) !== -1) {
                    notSet[i] = attributes[i];
                    continue;
                }

                if (i === 'stroke' || i === 'fill') {
                    var color = new Color(attributes[i]);
                    if (color.a < 255 || color.format === 'rgba') {
                        element.setAttribute(i, color.toString('rgb'));
                        if (color.a < 255) element.setAttribute(i + '-opacity', color.a / 255);
                        continue;
                    }
                }
                element.setAttribute(i, attributes[i]);
            }
        }

        return notSet;
    }

    return SvgRender;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('symbol.point.Image', ['Symbol', 'render.HtmlElement', 'serializer.symbolSerializer'], function (_Symbol, HtmlElement, symbolSerializer) {

    'use strict';

    var ImageSymbol = function (_Symbol2) {
        _inherits(ImageSymbol, _Symbol2);

        function ImageSymbol(properties) {
            _classCallCheck(this, ImageSymbol);

            return _possibleConstructorReturn(this, (ImageSymbol.__proto__ || Object.getPrototypeOf(ImageSymbol)).call(this, properties));
        }

        _createClass(ImageSymbol, [{
            key: 'renderFunction',
            value: function renderFunction(feature, resolution, crs) {
                if (feature.position === undefined) return [];

                var position = feature.projectTo(crs).position;
                var pxPosition = [position[0] / resolution, -position[1] / resolution];
                var renderPosition = [pxPosition[0] - this.anchorPoint.x, pxPosition[1] - this.anchorPoint.y];

                var html = '<img src="' + this.source + '"' + (this.width > 0 ? ' width="' + this.width + '"' : '') + (this.height > 0 ? ' height="' + this.height + '"' : '') + '>';
                return [new HtmlElement(html, renderPosition)];
            }
        }]);

        return ImageSymbol;
    }(_Symbol);

    ImageSymbol.prototype.width = 32;

    ImageSymbol.prototype.height = 32;

    ImageSymbol.prototype.anchorPoint = { x: 16, y: 32 };

    ImageSymbol.prototype.source = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAABECAYAAAA4E5OyAAAOVUlEQVR4Xu1cZ3RU1Rb+9kwyLWEmIYkhoUgQIgFUXKEEgbwgRUBAeIBSFAuIir0BPkQfCIrYQUFdKAj6RBBBH0VANFI1NEGaCASlhEDapGeSmfPWvpmUSbtn7gz4frjXyo/k7rPPPt89Z9/dTgh/kwcCdKXwEEKYAHQF0ANAOwCxAFoCCAJgdutRBKAAwGkAxwEcAbANQAoRFV8JXS8rIEIIC4AhAMYA6AfAqHFRJQA2AvgcwDdEVKhRjuqwywKIECISwGMAJgEIYS0EXMgtPYHMkl+Q7TiMgrIzKCg7izJXAZyC1wvoyYgAXRCCApohOKAFQgztEGa8EdbAa0DQVSwmB8ACAPOIKF11hV4y+BUQIQRv/akAJgPgI4IcxxGcKVyPs4WbUeLM9FK9cnajPgzNLP3Q3DJAAclNfIRe5R8i4qPmF/IbIEKIvgAWAWjBml0o2obf8z5RdoQ/KczYEW0a3Y0m5p4VYv8EMIGINvtjHp8BEUIEApgN4BkAlFt6Egez5yKjZK8/9KtXRrgxHteHTlaOk3IigdcBTCOiUl8m9gkQIYQNwJcA+rCN+D13CY7a31fsxZUgtitxtgfRxnpPhY35DsAIIrJrnV8zIG7DyZb/BocrBymZU5FRvEerHj6NCzd1QpewOTDoFPt9gL9oRHRRi1BNgLh3xnYAHQrLzmPnpUeQX8ZH+a8j/irdFPEuLAHRrMQh9ne07BSvAXE7WN8D6FZQdg7bL96PIqeml+F39M6l5iIpejHat+7OsncB6EVE5d90SdICyPsAHihxZmHrxfsUX+L/gVJPn0Z2VhaK7GZM6vUzYpp3YLU+IKIHvdHPK0CEEOxxfibgxLaLE5FVwsfVd9KT4rLAKbz3zoUQOHXqFOz2KjtamBGOmWNOwWIOZrFjiIg9XCmSBkQIEQ7gGICwQzlv40Tep1IT1GQK0FkQZU7CVaYEhATGKV6pjvjLDbhEqbLjckqP4mLxT0grSkaZq34vvS4wKubTZXTHv8dzGAT2Bq8lIimv0BtA2Okan+X4FVvT73N/+uUxYW8z1novWgYNRcWOUBvNO+Z0wRocz11cy8t1uVxITU312BnV5QkBdI9YhP7dWVd8REQT1Obj51KACCHYXz4k4KTk9Ltgd3AgKk8xwSPQ3vaoEqdoIY53DtvnIzWfXR6AwTh58iTy8vIaFFeUZcOssedhNJjZcetARBw9N0iygCwFcNeZgnXYm/WimszK53wU4hvPQFMLB7q+07nCTdidMR2/nzimCkbFbM3LHsb9w+fzr0uJ6G41LVQBEUJEATgj4NJ/f+EO5JWmqslUnusoAN3C5yHC1KVe/vSMP3E2ay8KSi4oPEHGJmjWOB6R4Uo4VCelHP0C647fCTbsMlSUE4yXx2YgMMDAA5oTUVpD42QAeRbA3PTindh1iSN6OYoPm4nmloG1mB2OEny0agqOZi2FLToHVBnVl7MKF2A/H4K4xuMwfvirMBhqp1C+3j4bezOnyynCrnTQHAzvwwE4JhPRa74CwuHqDXsyp+FsIXvq6nR10BDc2PiFWox7f/0ey7aPhDU6W10IgNzzobirx0rEX3dzLf5Xl/dEgXmHlBznpTjMnnCYeQ8QUUfNgAghmgBIcwkH1p3rVZnIaUhgoM6KvlGrYdBx3FdFW3Yux8bT42AKKpNaRAVTcX4AbolZit43jfIYl5OXhte+bQW9Qd0RdZYSnhuQieAgJdaJIqLyM1oHNXhkhBCjAfyHQ/ntFx+QWkhb20S0tU704D1+aj8W7UiAyaotMi/ODcSE7j8httWNHnLfWzMK6bRCSq+EsAUY2ENxWkcT0XKtgLzDqcBjuR/imP1D1Yk5HO8fvUHJcFWnZxdeA3O0nDGub5Ki8zF47aGTHo8vZqVi/tY2IFJPNzTKH4xnx37N4zn1+LhWQL4FcEtK5mScL+R4rmGKMHVG94iFHkzf//Q5ktPHqg2Vep4U+RluTuBNW0XTl8WArH+ojndmxWL2vexoYyMR9dcKyCkAMfy55UyYGrWzTUKsVfEMK+nFRV0hInarDZV6Tpc6Y8aEnz145385CpcC1Y+Nw27DnHGKMU8lolZaAeEMt40NaqmrYa+QJ+ga/gaizP/wmGvKUiuMtnypBasxFduDMXdcrgfb6h/mYn8u57UbJqcjELNHKgbYTkSKda2L1Iwqu7z4+kwXqbRgUuSnCDG0rTaPwPTV+lq+hpry9T1nH+WlYexfVam965fV2PDHcHWRgjBzaLkzR0T1rlsKkDVnOqlPCKB3kxVoFFi1Gx3OXMxaW+/LkJJZk+n5QTkw6K2Vf045uAFrU2+VkjXztnLje8UA6RX5GWyGayuV42Tzi2sCAVI2mu+kvGX2Y6re47a9q7D57EhV2UQ6zBhS7gP5AohiQ9aeS2wwL1GhTUL4m2hiTvRQ7vnPw6CzyHmmaqtyFYZg1ugsD7bP18/A0dIZakPhKgvErOG+25ATAK7ZlDYEnExWo3a2h5WcR3V6Y2Uf2A3qn2w12fzc5rgZT4/kSkMVvbJ4MIoar1Md7ixqhNmjlKzaSSJqXd8ANRvCK+m1/eJEZJTsU52UI9vuEVx2raKjf2zB8gP9wNktn4gIo2/YhLire3uIeWphJIKjL6mLzmuBmXdyUwF+IKLawZFbghogHwG4b3/WTPxR8I3qpER69I/+FkZdqAfv3FVdkB/gW80muKwTJg9P8ZB76LcULD+SAF2NiLkuRS2FN2HqaK6c4GMiGq91hzwM4N1T+SuU8qQM1XVs7AXn8Pbm9nCSpw8hI4959MKKJ/oehi2oqceQ6Qt6g5r+ICWmjelR3HULRyJ4hIje0wpIAtc3sh2H8GP6PVITc5TbN2oNAnWNPPhT01OwdFc/r0FhMMZ124SYSM9E05Hf9mHJni4wBavHMazIyOvW47pWisfejYh+0gpIAGetBVzW9ed6S3mrPFHL4GHoGDqt1pyZ+SexOHkocp2c2lSzKQSrvh3uTVqDsGCloF1JTqcTj78Vi8ZtJANGlxkzhuVx/Ze3aBgR1ZuDkMmYfQVg2O7M53CuUL7joHPYK2hq4Q4JT2LfZM+Jpdh2/E0U6U6gpMSzFmM0mmB2tUbP2KfQqfW46o0ylYJmzLsDzqtXSu1YZrKUdMLU2xX7s5qI/tnQQBlAODG7hMFgUGSJu4ESIt5GhLFzvUNKXNnILj6GwtLyRiBLYCRCTW1rGeXqAl7/8DFkhb6LAIOsJkBis3fQJ/5RHnA3EXHCvF6SAYTLX+ku4bBsON8PpS75QI1B6RT2cq2AT34pVZwOhwMvvjUG1Oorr8DQCTNeuC0bOjJwxSuSiBpcgCogrJIQQilD8JeGvzje0jWNxoBTA7IFqpryU/bswAfrxqJpR+87DKL0g/HQICUxtIyIxqnpLgsIR3e7ucy4OW2YhEGsPa1ZH4lrrePRImgQvy01vRRHbsfOrfhiyzTomu2CLUzNCNcWqdPpMSnxEK6yKfFVZyJSdYakAHHvkmQA//DWuNZUk5PQTS19cJWpq1LbNQc0UQzn7t27kW3PRuqZX3DiwjakFexEVFw2yuvV2qgx9cATQ7by4GQi6iUjxRtAktjt5caYLWkjpPIjMgpwQUtPFiQnJ8NoBnR6mVHqPHpdAB5MPIBIWxwzJxHRj+qjJGu7FYKEEOsBDDiQ/QpS81fJyJfm2bdPPVaSFsatkOahmNCPPQZsIKLaFbN6hEnvEPex4S6U/Q6XPWDLhREocfonrGfZ/gQkkGx4duApmAJC2QG7kYi4xUqKvALEDcocAFO4GXdvZu3qnNSsdTD5CxDODvaLfQ/d2yo1GG7qVU+4VtNHCyDcv86tQ61/znhGaWrxB/kLEG7Geaifkn/hXM713nY5ew2Ie5fwrYbtfHR+uDDaL013/gDEpIvA0wN/g1EfwkeFuxA9axYSb04TIG5Q/sUdzJw42nlpElzCu5ptTd18BSQwwIjRndajdaTydeWO5pcl1l+LxRdAOC3DWaNbubPnQDabFu3kCyA6nQ43t34NiXFPsgJrAdxGMvXNOtTVDIh7l3A9gMPIaxmQipYnLbBoBoQIHSLvxu1dP+ZpfwPQhUhjJkq2x6yhBQoh2gDYKeAKT8mYgrQiuQyWv45MTOgA3JP4X/Z2M9zJHzammsmnHVIxqxCCY/xkpyix7Mp4XFPPu5Yd0iykByYkflcRybI36nMR2S+AuI8P5+e+cYriwF0ZT3gNireANAvpifGJGzmC5qaTwUQk196ksnf8BogbFL5f96UWULwBpAYYfB1EvSQgeYj8Ckg1UFY6RbEhJWMyuFlPhmQAYS+0VVhf3HnTGt4ZDs4d+xMM1tPvgLhBYWdgjUuUWvdnv4QzBRwTNkxqgPCntX3UKAyPX8yt4Jws5k+rf9zkaqpdFkDcoHBD2EZARByxL1DasxuihgAxGAxIaPk0+sTN4nfIZbpbiGi/Gshanl82QNygxADgwmscB4NcAazPo60PELMpGLde9z6uj+aLGMrF5kFEJFl/8B6SywqIGxTuz+Suv/5ZjoNgX6XYWbsWWxcgocEtMCZhFSKD4lkU97uN0nJLyhtYLjsgblA4D8Z3bJ/mi0e7+X5ejeJ5dUDYXsSEJ2FUlxUw6huziDc45UBEcv3c3iBQg/eKAFLNgePepyUCzuCj9oU4nvtJZcK6AhCTyYJuMU8iKXYGe59cMriHiPybnmsAsCsKiHu3cAqcaxnXXypOwd6sF1DszFAyZmHWqzEifhmaWvn/JeAggNuJiOOTK0ZXHBA3KHynjNsJHuXqHRvbzMxM9G0zr+Kq6Tz3EfH+zpmP0P0lgFQ7QtwttwQAX19jYmt7LxGptwT5uPD6hv+lgLh3C/8nCW7M4UrUeK0XkP2Fz18OiL8W4i85fwNSA8n/AV6gUZDNezugAAAAAElFTkSuQmCC';

    symbolSerializer.registerSymbol(ImageSymbol, 'point.Image', ['width', 'height', 'anchorPoint', 'source']);

    return ImageSymbol;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('symbol.point.MaskedImage', ['Symbol', 'render.HtmlElement', 'utils.Color', 'serializer.symbolSerializer'], function (_Symbol, HtmlElement, Color, symbolSerializer) {

    'use strict';

    var MaskedImage = function (_Symbol2) {
        _inherits(MaskedImage, _Symbol2);

        function MaskedImage(properties) {
            _classCallCheck(this, MaskedImage);

            var _this = _possibleConstructorReturn(this, (MaskedImage.__proto__ || Object.getPrototypeOf(MaskedImage)).call(this, properties));

            if (!_this._image) _this.imageSource = _this._imageSource;
            if (!_this._mask) _this.maskSource = _this._maskSource;

            _this._updateMasked();
            return _this;
        }

        _createClass(MaskedImage, [{
            key: 'renderFunction',
            value: function renderFunction(feature, resolution, crs) {
                if (feature.position === undefined) return [];

                if (!this._isLoaded()) return [];

                var position = feature.projectTo(crs).position;
                var pxPosition = [position[0] / resolution, -position[1] / resolution];
                var renderPosition = [pxPosition[0] - this.anchorPoint.x, pxPosition[1] - this.anchorPoint.y];

                var html = '<img src="' + this._maskedSrc + '"' + (this.width > 0 ? ' width="' + this.width + '"' : '') + (this.height > 0 ? ' height="' + this.height + '"' : '') + '>';
                return [new HtmlElement(html, renderPosition)];
            }
        }, {
            key: '_isLoaded',
            value: function _isLoaded() {
                return this._image.complete && this._mask.complete;
            }
        }, {
            key: '_updateMasked',
            value: function _updateMasked() {
                if (!this._mask | !this._image || !this._isLoaded()) return;

                var canvas = document.createElement('canvas');
                canvas.width = this._mask.width;
                canvas.height = this._mask.height;

                var ctx = canvas.getContext('2d');
                ctx.drawImage(this._mask, 0, 0);

                var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                this._recolorMask(imageData);
                ctx.putImageData(imageData, 0, 0);

                var resultCanvas = document.createElement('canvas');
                resultCanvas.width = this._image.width;
                resultCanvas.height = this._image.height;

                var resultCtx = resultCanvas.getContext('2d');
                resultCtx.drawImage(this._image, 0, 0);
                resultCtx.drawImage(canvas, 0, 0);

                this._maskedSrc = resultCanvas.toDataURL(0, 0, this._image.width, this._image.height);
            }
        }, {
            key: '_recolorMask',
            value: function _recolorMask(imageData) {
                var maskColor = new Color(this.maskColor);
                var alphaNormalizer = 65025;

                var d = imageData.data;
                for (var i = 0; i < d.length; i += 4) {
                    var r = d[i];
                    var a = d[i + 3];
                    var srcA = a * maskColor.a / alphaNormalizer;
                    d[i + 3] = +Math.round(Math.min(1, srcA) * 255);
                    d[i] = maskColor.r * r / 255;
                    d[i + 1] = maskColor.g * r / 255;
                    d[i + 2] = maskColor.b * r / 255;
                }
            }
        }, {
            key: 'imageSource',
            get: function get() {
                return this._imageSource;
            },
            set: function set(source) {
                this._imageSource = source;

                this._image = new Image();
                this._image.onload = this._updateMasked.bind(this);
                this._image.src = source;
            }
        }, {
            key: 'maskSource',
            get: function get() {
                return this._maskSource;
            },
            set: function set(source) {
                this._maskSource = source;

                this._mask = new Image();
                this._mask.onload = this._updateMasked.bind(this);
                this._mask.src = source;
            }
        }, {
            key: 'maskColor',
            get: function get() {
                return this._maskColor;
            },
            set: function set(color) {
                this._maskColor = color;
                this._updateMasked();
            }
        }]);

        return MaskedImage;
    }(_Symbol);

    MaskedImage.prototype.width = 32;

    MaskedImage.prototype.height = 32;

    MaskedImage.prototype.anchorPoint = { x: 16, y: 32 };

    MaskedImage.prototype._imageSource = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAABECAYAAAA4E5OyAAAACXBIWXMAABYlAAAWJQFJUiTwAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAB7lJREFUeNrsnH9QVNcVx793Xdhll44GUbEzKNoWzQI6/go4ExHTGujYRg1MYtOpzsQ/mkAaK4nB/6haZ5pO80eTOGxmMmOaTuM/TabSzDBaBIV1tJUxbEQKnSWY8kcMYQwICyzD8u0fvkeXLOze3XcfvExyZt7M7tt7zj3nw333x7nvIkjiW/m/2GP9KIRQVhFJJ4BCAI8C8ADIBZADwA0gTSs2BiAI4A6A/wDoBNAK4F9CiHGFvsT+ca5LQcUukgdI1pMcZ/IyTvK8ZsulAsicMZsBhOQKkqdJfkn18qVme4XlgZBMI3mC5BjNlzGSvyGZZkkgJHeT/JTzL5+S3G0ZICRTSP6e5BQXTqY0H1KMAhGxAo83ypBcDOCvAH5kkVGzEUCFEGIo2VEmaSBap3YBwEaLTSX8AB4XQvTPGxCtZfgA5Ft0ftUB4NG5WkqsmG1JTrAarAYjHA7jxImT6OnpgeZbA0mH2jF59vJeWkwmJyf5i4OHmJLq4OqcNezr69N/8po6ypB8xmowQqEQ9z9ZzpRUx/T1SGERx8amp0I/MwUIyUySA1aDsW//kzNg6FdlVZVebIDkUjOAvG0lGMFgkHv37psVhn41NTfrxd9WCoSkZ4EnXlEwdu9+PCaMlFQH8ws2MBQK6RM3jwwQ2VHmOABhhdFkdHQU+/btx+UrV+KW7e7uxjvv/Ama7zUy9uPOQ0iuBNAHYJHq4O7du4eBgQGMjo4CAFwuFzIzM5GRkTGnTmdnJ4p3luD+/ftSdaxduxYdtz6G3W4PA8gWQnxmKB9C8pjqjvDNM2foycufs6l78vL55pkzenOPkgsXLzLV4Yz7yOhXfX29rnrMcB9Csl0VDL/fz4ING6UDKdiwkX6/f1Zbr7xSI23nqacP6GrthoCQzFIFo6WllRlLM6WD0K+HMpaypaU1yt7IyAhXrc6RsuFO/w6DwaCummWkU92loq/o7e1FeUUFhoeHE9YdGRlBeUUFent7Z9x3u92orj4qZWNiYgLXrl/Xv5bEKhsPSJEKIJWVVRgcHExaf3BwEJWVVVH3Dx08CIdDbrnia/XpH7cbAbLOKAyf7youNTUZhnqpqQk+39UZ95YsWYIfPvaY3PL39m2pmOIByTUayLt/flfZMD2brR3FO6R0A4GAVEzxgGQYDaKlpVUZkNlsrV+/Xkr37t3PpGKKB2Sxig5Vlcxm67srV0p2zkGpmGwwUVRteMWyZ7PJhRAKhaTKmQpECCE9CsiIw+GISmuGQhNSuk6nUwmQIaNB5OXlKQPi8Xii7t25I/dIulwuqZjiARkwGkRZaakyID8uK4tOsfs/ltLNysqSiikekP8aDeLw4WeRkpJiGIbdbsfhw89G3f9HY6OU/upVq6RiigfE8BCRnZ2NyuefNwykqrIS2dnZUfmO9vZ2Kf3c3FypmOIBuamiqZ86dRJbtmxJWn/z5s04depk1P3X33gjARub5GKKs9otUrXa7e//goVF2xNe7RYWbWd//xdR9rq7u+lyp0vb6enp0VWLjCz/7SSHlL2/MDbG6uqX6ExzxQ3AmeZidfVLkdsJM/ZhSnbtkoaxbv3DuuqQFpOhBNEHqpPEgUCANTXHmZdfEOV8Xn4Ba2qOMxAIzKmfSHIoJdXBo0erddUPVGTMDpmZQQ+HwwyFQgyFQgyHw3HL/+7VVxN+7K5du66rH1QBJJ1k0AqbUi++eCRhGA978qZ3L0imG96GEEKMAHh/Ibce2trasKN4J+q83oR1n3vul/rH97VYjG92k9w6768ETU3R57vKp54+kFCGPfJatnwFh4eHdZNbZWK2Sy7S2kheAbDTrFZw48YNDA4N4ZOeT3Dzo5tobLyEvr4+QzZ/9cILSE9PB4DLQog2JRtVEVRLADSbBSTV4VRqb/myZejq+rcOpEQIcSWyhRhe/gshLuPBizJfC6mtrdVhNETCUNZCNLL5AD4C5B61hWohRUWFuNzcDJvNNglgkxCi46v9ppIEkWb4NSu3jNTUVHjr6vRM2mtfhWFGxuwkgIBVgZw+/Vs9kRQAcCLhLF+SbyEW4sFbiHYrPTJlpaU4f/5vEEJM4sFbiP+ca6qhNKeqVVRrpZaRk5ODs2fP6n/E2rlgmNJCNMo2APUA9ix0C3G73fC1tuj52w8B7BVCTMWajCrPumsVPgOgeyFbht1ux3vv/UWH0Q3g57FgmLoNIYS4D+CnKpLRycpbXq+efB4A8BPNp+RFxfEQktuMroiTWavU1XkjV7LblMSs8LxMGcmJ+QLi9b6lq06QLFXWCBSfqHoiWSgGYDyh9KlQfeZOgxIyA4jLnc5z585N54ySgTHvQLQKdyWanJZ51+zCxYuRyeISU/pNs46pktxEsl8FkO99/we8devW9I4GyU2mDSQmn9tdQ7LTCJAdxcW8+/nnerHbJNco8GthgGiVLybZkAyQI0d+HfnyboN2kgtfayCaA4tI/kEWyOIlD0V2ntR0Fyn0Z2GBRDhSTnI4FpCt2x5hV1eXfnuYZLkJflgDiObMOpL+2YC8/PIxjo9P/4sAP8l1JvlgHSCaQ06Sr0cC6ejoiPz6R+2wI74RQCIc20Mycmu/n+SeeajXmkA051aQ/JDk30kun6c6kzvq/k0U27cIZsr/BgDbzNoD8uJVDwAAAABJRU5ErkJggg==';

    MaskedImage.prototype._maskSource = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAABECAYAAAA4E5OyAAAACXBIWXMAABYlAAAWJQFJUiTwAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAABjRJREFUeNrsnH1oV1UYxz+b8wVfVlnZQ6kh2qBCrLbSf8ICjah/VIRKDSukUlNEQchETSHFFwxDSRA1gjJQfPljgr04EcR3Y8EKUwQxeNKcpi42p1t/3Gf063I3z7m/c3/7WfvC/tjduec853Ofc85znnPvSlpbW+nSPyrtQtAFpEOVuRRS1bwbEpFSYBjwFPAkMAgYCPQBelqxJqABuACcB+qAU8BZVW0JYMMdy5S4zCH5ABGRJ4BXgLHA/SmruQzsA/aqat1dCUREngemmkeE1I/AF6p68K4AIiJDgflAZcbD/QSwUlXPFiUQmyPeAt4v4GTdAnwObHWZY1yABDFcRO4FNgAzCrxylVqbG8yGzl92ReRhYDNQ1YmrZRWw2WzpPCAi8giwCRhcBCHEYGCT2VR4ICLSH1gPDCiiuGoAsN5sKxwQEekGrLLAKoQa7SeEBgKrRKQszc1lKRudBYxIee9fQA1wGPgZuKCqzQa6u3XocWAU8ALQO0UbI4APgE99b/RedkVkuE2iJSmizS3ALlVtdPTEXsA44O0UUW4r8I6q/pRZHGJD5UugwtO47cBnqtqQcoj2Ma+c6HnraeBNVb2dVRzysieMZmCBqq5IC8MeSIOqrgAWWJ2uqjCbww8Zi0S/AYY41n0LmK2qRzt48n3N6Afs0h/AaVW90cE9zwHrPOa/c8Brqtri4iE+k+ooDxgAS5NgiEgJMBp4A3g6wUtbROQU8DVwQFVbYw/nqIh8DCxztGOI2X4o9LL7qkfZPapanQBDgI3Aatv8lbZjU6WV2SgJj1VV9wJ7srC9xDGn2gPYn5PI6UjXgPGq+mcMxjDb7/gGTfXADFU9E6uvHNgFlDvU0QS8CNwM5SHDHWEAbEuA0d/GfZoIsj+wLh59quo1YJtjHT2tD8GGjGtuowXYkXB9fp4h/gCrI2k5v+1YxzMhgQxzTdqo6uWYd1QAYwKE5GOsrlwvqQdOOt7/WEggjzqWO5ZwbVzAzds4xzZT96HUw2VddLad5TqURiZcOxOyD65A+jiW+z0h5hgYEMggq7PdNvPtgysQ13LxZa0vYVOKpVZnfEkN1ofQ+c/usd8bbOUJpRbgRkKMFJS4aw7DRQ/FVoEWolO4ULoQD+UBCdkHVyBXHcsNzWMVSLuKDQ3ZB1cgridVzyZc2x0QSFJdVSH74ArE1e0rReS+2LCpI0oZ5qua+LmutVUVsg+uQH5xLNetneBpuW3S0qre6kgK1LqF7IMrEJ8T9yki0i/mJZeBmR5zUXzsz0zYEvQDpnjUUxcayHXHsvcAsxNyGL8SvQ1Q69GJWmCq3RvXLGvLRdeDArHl87BHR8aLyNiEen4DphHlRmvvAGIBMM3uiSeaxgITPOw54vrCjU8K8Qeil15ctURErqrqsQS4+4B9NilWAA/any8R5VSvtFepiFQCSzyH3feuBX2SzD2sI309DGkiyrofCLHmisho4BPck1VYZPuSqt4MegyhqjeBas8+9ATWiMhcO3RKC6KXiMwF1njCAKg224OG7m36iuhEzFeTgB0iMsE8zRVEDxGZQJQZm5Si3VazmeBDJsfI5Z5zSVzXgO+AI0Rnu9o24dnZjxCd7Y4kyrSV59HWt6r6YY7tmQAZbE8s1E75Vs7GqzfpD+CTdsYTVfW8DxDvTlkDOwPuT8rMC8oDwgDYmQsjqzmkTRuAKxSvrpiNFASInbusLWIga+NnQ1l7CHZUWVOEMGqSjlEzB2JaBlwsIhgXcT8EDw/E3HKhrRSdrVvAwrRDJZSHoKoniU7qO1urzRY6FYhB2W6xSWdpu9lAUQAxrSR6ZaLQ2m9tU1RALPxeCBwvIIzjwEchPi7KwkNQ1SZgToGgHAfm+OxkCw7EoDQWAEobjMbQFWfyKUcOlEMZVH8oKxiZAcmBMg//pFJHqgbmZQUjUyAGpRlYTPRKd77aAixuey8+K5WRsexwer2InAMWpWizGViWz/6kaDwkYTP4LlFm3VWXgPcKBaOgQAxKLTAZtxflTgCT7R7+k0AMSj0wHdhKcsK61f423coWVJl/2d2R7EX+pfz75f9FHX0wkGd7xechMdBHiT4COGg/r2cFI6iH/J/U9e8yuoB0AfHS3wMAkOtpr8ibyvkAAAAASUVORK5CYII=';
    MaskedImage.prototype._maskColor = '#9bdb00';

    symbolSerializer.registerSymbol(MaskedImage, 'point.MaskedImage', ['width', 'height', 'anchorPoint', 'imageSource', 'maskSource', 'maskColor']);

    return MaskedImage;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('symbol.point.Point', ['Symbol', 'render.Arc', 'serializer.symbolSerializer'], function (_Symbol, ArcRender, symbolSerializer) {

    'use strict';

    var PointSymbol = function (_Symbol2) {
        _inherits(PointSymbol, _Symbol2);

        function PointSymbol(properties) {
            _classCallCheck(this, PointSymbol);

            return _possibleConstructorReturn(this, (PointSymbol.__proto__ || Object.getPrototypeOf(PointSymbol)).call(this, properties));
        }

        _createClass(PointSymbol, [{
            key: 'renderFunction',
            value: function renderFunction(feature, resolution, crs) {
                if (feature.position === undefined) return [];

                var position = feature.projectTo(crs).position;
                var pxPosition = [position[0] / resolution + this.offset.x, -position[1] / resolution + this.offset.y];

                var point = new ArcRender(pxPosition, { fillColor: this.fillColor, strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, radius: this.size / 2 });
                return [point];
            }
        }]);

        return PointSymbol;
    }(_Symbol);

    PointSymbol.prototype.size = 10;

    PointSymbol.prototype.offset = { x: 0, y: 0 };

    PointSymbol.prototype.fillColor = 'black';

    PointSymbol.prototype.strokeColor = 'transparent';

    PointSymbol.prototype.strokeWidth = 1;

    symbolSerializer.registerSymbol(PointSymbol, 'point.Point', ['size', 'offset', 'fillColor', 'strokeColor', 'strokeWidth']);

    return PointSymbol;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('symbol.point.Square', ['Symbol', 'render.Polygon', 'serializer.symbolSerializer'], function (_Symbol, PolygonRender, symbolSerializer) {

    'use strict';

    var SquareSymbol = function (_Symbol2) {
        _inherits(SquareSymbol, _Symbol2);

        function SquareSymbol(properties) {
            _classCallCheck(this, SquareSymbol);

            return _possibleConstructorReturn(this, (SquareSymbol.__proto__ || Object.getPrototypeOf(SquareSymbol)).call(this, properties));
        }

        _createClass(SquareSymbol, [{
            key: 'renderFunction',
            value: function renderFunction(feature, resolution, crs) {
                if (feature.position === undefined) return [];

                var position = feature.projectTo(crs).position;
                var pxPosition = [position[0] / resolution, -position[1] / resolution];
                var halfSize = this.size / 2;
                var offset = this.offset;
                var coordinates = [[pxPosition[0] - halfSize + offset.x, pxPosition[1] - halfSize + offset.y], [pxPosition[0] - halfSize + offset.x, pxPosition[1] + halfSize + offset.y], [pxPosition[0] + halfSize + offset.x, pxPosition[1] + halfSize + offset.y], [pxPosition[0] + halfSize + offset.x, pxPosition[1] - halfSize + offset.y]];

                return [new PolygonRender(coordinates, { fillColor: this.fillColor, strokeColor: this.strokeColor, strokeWidth: this.strokeWidth })];
            }
        }]);

        return SquareSymbol;
    }(_Symbol);

    SquareSymbol.prototype.size = 10;

    SquareSymbol.prototype.offset = { x: 0, y: 0 };

    SquareSymbol.prototype.fillColor = 'black';

    SquareSymbol.prototype.strokeColor = 'transparent';

    SquareSymbol.prototype.strokeWidth = 1;

    symbolSerializer.registerSymbol(SquareSymbol, 'point.Square', ['size', 'offset', 'fillColor', 'strokeColor', 'strokeWidth']);

    return SquareSymbol;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('symbol.polygon.BrushFill', ['Symbol', 'symbol.polyline.Simple', 'render.Polygon', 'utils.Color', 'serializer.symbolSerializer'], function (_Symbol, PolylineSymbol, PolygonRender, Color, symbolSerializer) {

    'use strict';

    var ALPHA_NORMALIZER = 65025;

    var PolygonSymbol = function (_Symbol2) {
        _inherits(PolygonSymbol, _Symbol2);

        function PolygonSymbol(properties) {
            _classCallCheck(this, PolygonSymbol);

            var _this = _possibleConstructorReturn(this, (PolygonSymbol.__proto__ || Object.getPrototypeOf(PolygonSymbol)).call(this, properties));

            _this._updateBrush();
            return _this;
        }

        _createClass(PolygonSymbol, [{
            key: 'renderFunction',
            value: function renderFunction(feature, resolution, crs) {
                var coordinates = PolylineSymbol._getRenderedCoordinates(feature, resolution, crs);
                if (!coordinates) return [];
                return [new PolygonRender(coordinates, { strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, fillStyle: 'image', fillImage: this._brush, lineDash: this.lineDash })];
            }
        }, {
            key: '_updateBrush',
            value: function _updateBrush() {
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                var brush = this.fillBrush;
                var foreground = new Color(this.fillForeground);
                var background = new Color(this.fillBackground);

                canvas.height = brush.length;
                canvas.width = brush[0].length;

                for (var i = 0, l = brush.length; i < l; i++) {
                    for (var j = 0, m = brush[i].length; j < m; j++) {
                        var srcA = brush[i][j] * foreground.a / ALPHA_NORMALIZER,
                            dstA = background.a / 255 * (1 - srcA),
                            a = +Math.min(1, srcA + dstA).toFixed(2),
                            r = Math.round(Math.min(255, background.r * dstA + foreground.r * srcA)),
                            g = Math.round(Math.min(255, background.g * dstA + foreground.g * srcA)),
                            b = Math.round(Math.min(255, background.b * dstA + foreground.b * srcA));

                        ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
                        ctx.fillRect(j, i, 1, 1);
                    }
                }

                this._brush = new Image();
                this._brush.src = canvas.toDataURL();
            }
        }, {
            key: 'fillBrush',
            get: function get() {
                return this._fillBrush;
            },
            set: function set(brush) {
                this._fillBrush = brush;
                this._updateBrush();
            }
        }, {
            key: 'fillBackground',
            get: function get() {
                return this._fillBackground;
            },
            set: function set(color) {
                this._fillBackground = color;
                this._updateBrush();
            }
        }, {
            key: 'fillForeground',
            get: function get() {
                return this._fillForeground;
            },
            set: function set(color) {
                this._fillForegroudn = color;
                this._updateBrush();
            }
        }]);

        return PolygonSymbol;
    }(_Symbol);

    PolygonSymbol.prototype._fillBrush = [[255, 255, 0, 0, 0, 0, 0, 0, 255, 255], [255, 255, 255, 0, 0, 0, 0, 0, 0, 255], [255, 255, 255, 255, 0, 0, 0, 0, 0, 0], [0, 255, 255, 255, 255, 0, 0, 0, 0, 0], [0, 0, 255, 255, 255, 255, 0, 0, 0, 0], [0, 0, 0, 255, 255, 255, 255, 0, 0, 0], [0, 0, 0, 0, 255, 255, 255, 255, 0, 0], [0, 0, 0, 0, 0, 255, 255, 255, 255, 0], [0, 0, 0, 0, 0, 0, 255, 255, 255, 255], [255, 0, 0, 0, 0, 0, 0, 255, 255, 255]];

    PolygonSymbol.prototype._fillBackground = 'transparent';
    PolygonSymbol.prototype._fillForeground = 'black';

    PolygonSymbol.prototype.strokeColor = 'black';

    PolygonSymbol.prototype.strokeWidth = 1;

    PolygonSymbol.prototype.lineDash = [];

    symbolSerializer.registerSymbol(PolygonSymbol, 'polygon.BrushFill', ['fillBrush', 'fillBackground', 'fillForeground', 'strokeColor', 'strokeWidth']);

    return PolygonSymbol;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('symbol.polygon.ImageFill', ['Symbol', 'symbol.polyline.Simple', 'render.Polygon', 'serializer.symbolSerializer'], function (_Symbol, PolylineSymbol, PolygonRender, symbolSerializer) {

    'use strict';

    var PolygonSymbol = function (_Symbol2) {
        _inherits(PolygonSymbol, _Symbol2);

        function PolygonSymbol(properties) {
            _classCallCheck(this, PolygonSymbol);

            var _this = _possibleConstructorReturn(this, (PolygonSymbol.__proto__ || Object.getPrototypeOf(PolygonSymbol)).call(this, properties));

            if (!_this._image) _this.src = _this._src;
            return _this;
        }

        _createClass(PolygonSymbol, [{
            key: 'renderFunction',
            value: function renderFunction(feature, resolution, crs) {
                if (!this._image.complete) {
                    this._image.onload = feature.redraw.bind(feature);
                    return [];
                }
                var coordinates = PolylineSymbol._getRenderedCoordinates(feature, resolution, crs);
                if (!coordinates) return [];
                return [new PolygonRender(coordinates, { strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, fillStyle: 'image', fillImage: this._image, lineDash: this.lineDash })];
            }
        }, {
            key: 'src',
            get: function get() {
                return this._src;
            },
            set: function set(src) {
                this._src = src;
                this._image = new Image();
                this._image.src = src;
            }
        }]);

        return PolygonSymbol;
    }(_Symbol);

    PolygonSymbol.prototype._src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    PolygonSymbol.prototype.strokeColor = 'black';

    PolygonSymbol.prototype.strokeWidth = 1;

    PolygonSymbol.prototype.lineDash = [];

    symbolSerializer.registerSymbol(PolygonSymbol, 'polygon.ImageFill', ['src', 'strokeColor', 'strokeWidth']);

    return PolygonSymbol;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

sGis.module('symbol.polygon.Simple', ['Symbol', 'symbol.polyline.Simple', 'render.Polygon', 'serializer.symbolSerializer'], function (_Symbol, PolylineSymbol, PolygonRender, symbolSerializer) {

    'use strict';

    var PolygonSymbol = function (_Symbol2) {
        _inherits(PolygonSymbol, _Symbol2);

        function PolygonSymbol(properties) {
            _classCallCheck(this, PolygonSymbol);

            return _possibleConstructorReturn(this, (PolygonSymbol.__proto__ || Object.getPrototypeOf(PolygonSymbol)).call(this, properties));
        }

        _createClass(PolygonSymbol, [{
            key: 'renderFunction',
            value: function renderFunction(feature, resolution, crs) {
                var coordinates = PolylineSymbol._getRenderedCoordinates(feature, resolution, crs);
                if (!coordinates) return [];
                return [new PolygonRender(coordinates, { strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, fillColor: this.fillColor, lineDash: this.lineDash })];
            }
        }]);

        return PolygonSymbol;
    }(_Symbol);

    PolygonSymbol.prototype.fillColor = 'transparent';

    PolygonSymbol.prototype.strokeColor = 'black';

    PolygonSymbol.prototype.strokeWidth = 1;

    PolygonSymbol.prototype.lineDash = [];

    symbolSerializer.registerSymbol(PolygonSymbol, 'polygon.Simple', ['fillColor', 'strokeColor', 'strokeWidth']);

    return PolygonSymbol;
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

sGis.module('plugins.ZoomButtons', ['utils'], function (utils) {

    "use strict";

    var TOP_CLASS = 'sGis-top';
    var BOTTOM_CLASS = 'sGis-bottom';
    var LEFT_CLASS = 'sGis-left';
    var RIGHT_CLASS = 'sGis-right';

    var WRAPPER_CLASS = 'sGis-zoomButtons';
    var ZOOM_IN_CLASS = 'sGis-zoomButtons-zoomIn';
    var ZOOM_OUT_CLASS = 'sGis-zoomButtons-zoomOut';

    var ZoomButtons = function () {
        function ZoomButtons(map, wrapper, properties) {
            _classCallCheck(this, ZoomButtons);

            this._map = map;
            this._init(wrapper);
            if (properties) utils.extend(this, properties, true);
        }

        _createClass(ZoomButtons, [{
            key: '_init',
            value: function _init(wrapper) {
                var container = utils.createNode('div', this.wrapperClass, {}, [utils.createNode('div', ZOOM_IN_CLASS, { onclick: this._zoomIn.bind(this) }), utils.createNode('div', ZOOM_OUT_CLASS, { onclick: this._zoomOut.bind(this) })]);

                wrapper.appendChild(container);
                this._container = container;
            }
        }, {
            key: '_zoomIn',
            value: function _zoomIn() {
                this._map.zoom(1);
            }
        }, {
            key: '_zoomOut',
            value: function _zoomOut() {
                this._map.zoom(-1);
            }
        }, {
            key: '_updateContainerClass',
            value: function _updateContainerClass() {
                this._container.className = this.wrapperClass;
            }
        }, {
            key: 'position',
            get: function get() {
                return this._position;
            },
            set: function set(position) {
                this._position = position;
                this._updateContainerClass();
            }
        }, {
            key: 'wrapperClass',
            get: function get() {
                var className = WRAPPER_CLASS;
                className += ' ' + (this._position.indexOf('right') >= 0 ? RIGHT_CLASS : LEFT_CLASS);
                className += ' ' + (this._position.indexOf('bottom') >= 0 ? BOTTOM_CLASS : TOP_CLASS);
                return className;
            }
        }]);

        return ZoomButtons;
    }();

    ZoomButtons.prototype._position = 'top left';

    return ZoomButtons;
});