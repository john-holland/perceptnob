Array.prototype.sum = function() { return this.reduce((a, c) => a + c, 0); }
Array.prototype.randomize = function({
  varianceFn = (val) => val,
  fixateZero = true
} = {}) {
  return this.map(val => val + (Math.random() - (fixateZero ? -0.5 : 0)) * varianceFn(val));
}
Array.prototype.previousOrFirst = function(index) { return (index == 0 ? this[0] : this[index - 1]); }
Array.prototype.last = function() { return this.length > 0 ? this[this.length - 1] : undefined; }
const feedforwardSum = (inputs, nobs) =>
  inputs.map((value, i) => value * nobs[i]).sum();

// ok, somewhere in here we reach into negative and positive infinities lol
const adjustNobs = (nobs, bias) => {
  return nobs.map((val, i) => val + Math.random() + (val * bias[i]));
}

const biasFunction = (goal, nobs, previousNobs, previousSum) => {
  // for now, we'll do an additive bias, because we're trying to learn numbers
  // but in the future, we should probably do something like y = mx + b or point slope form, can't remember that rn though lol

  const nobsDiff = nobs.map((nob, i) => previousNobs[i] - nob);
  const nobsAvg = nobs.map((nob, i) => (previousNobs[i] + nob) / 2);

  const goalDiff = goal - previousSum;

  // i feel like there's some control here, around standard deviation of how far we adjust the nob, based on bias?
  // lets not worry about that for now, but like, yeah idk, maybe 1 deviation
  // nobsDiff * (goalDiff > 0 ? -1 : (goalDiff < 0 ? 1 : 0)));
  const bias = nobsDiff.map((nob, i) => nob + nobsAvg * (goalDiff > 0 ? -1 : (goalDiff < 0 ? 1 : 0)));

  return bias;

  // do we want to change the bias function to be considerate of the current value, rather than just the diffs?

  // obviously code after return, no bueno
  // {
  //   const y = goal // problem: we don't have the goal, we only have previous sums
  //
  //   const y = previousSum - goal // difference to the goal?
  //   const m = bias // difference of the adjusted nobs, adjusted by the difference of the sum to the goal?
  //   const x = inputs //
  //   const b = nobs
  //
  //   // it could be:
  //   const y = goal
  //   const m = nobs
  //   const x = input
  //   const b = bias
  // }
}

const perceptron = (inputs) =>
   activationFunction(sum(inputs));

const correctGuess = 134;
const goal = correctGuess;

const inputs = [32,33,34,35];

const randomInputs = inputs.randomize();

const initialNobs = [0, 0, 0, 0];
const initialPreviousInputs = [32,33,34,35];
const initialBias = [0, 0, 0, 0];
const initialSum = Math.random() * correctGuess * 2; // the correctGuess randomized with variance of 2 (whatever variance means lol)

const generationNobsStack = [[...initialNobs]];
const generationAdjustedInputs = [[...initialPreviousInputs]];
const generationBias = [[...initialBias]];
const generationSums = [[initialSum]]

const previousNobs = (generation) => generationNobsStack.previousOrFirst(generation);
const previousBias = (generation) => generationBias.previousOrFirst(generation);
const previousSum = (generation) => generationSums.previousOrFirst(generation);

// should we adjust the nobs before or after feedforwardSum()?
// it would be fun to record learning accuracy and learn which is better, heh

const useError = true;
const allowedError = 0.5;

for (let generation = 0; generation < 10; generation++) {
    const nobs = adjustNobs(previousNobs(generation), previousBias(generation));
    generationNobsStack.push(nobs);
    const bias = biasFunction(correctGuess, nobs, previousNobs(generation), previousSum(generation), correctGuess);

    generationBias.push(bias);

    const sum = feedforwardSum(inputs, nobs);

    generationSums.push(sum);

    if (sum === goal || useError && Math.abs(sum - goal) < allowedError) {
      console.log('yay learnt maths!');
    }

    if (nobs.some(isNaN)) {
      console.log(`Error! invalid nob detected in generation ${generation}, ${nobs.join(',')}`)
    }

    const output = inputs.map((val, i) => `(${val} + ${nobs[i]})`).join(' + ')
    console.log(`generation: ${generation}, theoretical addition: ${output} = ${sum} `)
}
