# async-singleton

## Usage

```js
import singletonAsync from '@grainrigi/async-singleton';

const func = singletonAsync(function() {
  return new Promise(resolve => { console.log('hoge'); resolve(); });
});

(async () => {
  func();
  func();
  await func();

  console.log('awaited');

  func();
  await func();
})();

/* Result
hoge
awaited
hoge
*/

```

Argument comparison and slicing

```js
// function calls with different arguments are not aggregated
import singletonAsync from '@grainrigi/async-singleton';

const func = singletonAsync(function(arg1) {
  return new Promise(resolve => { console.log(arg1); resolve(); })
});

func(0);
func(1);
func(2);

/* Result
0
1
2
*/

// compare only sliced range
const func = singletonAsync(function(arg1, arg2) {
  return new Promise(resolve => { console.log(arg1, arg2); resolve(); })
}, { slice: [1, 2] });

func(0, 0);
func(1, 0);
func(1, 1);

/* Result
0 0
1 1
*/

```

## Acknowledgement

The implementation is based on [shokai/async-singleton](https://github.com/shokai/async-singleton).