function assertTrue<T>(x: T): asserts x {
    if (!x) {
        throw new EvalError("Assertion error.");
    }
}
