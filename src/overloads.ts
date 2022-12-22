type Overloads1<T> = T extends {
  (...args: infer P1): infer R;
}
  ? (...args: P1) => R
  : never;

type Overloads2<T> = T extends {
  (...args: infer P1): infer R;
  (...args: infer P2): infer R;
}
  ? (...args: P1 | P2) => R
  : never;

type Overloads3<T> = T extends {
  (...args: infer P1): infer R;
  (...args: infer P2): infer R;
  (...args: infer P3): infer R;
}
  ? (...args: P1 | P2 | P3) => R
  : never;

type Overloads4<T> = T extends {
  (...args: infer P1): infer R;
  (...args: infer P2): infer R;
  (...args: infer P3): infer R;
  (...args: infer P4): infer R;
}
  ? (...args: P1 | P2 | P3 | P4) => R
  : never;

type Overloads5<T> = T extends {
  (...args: infer P1): infer R;
  (...args: infer P2): infer R;
  (...args: infer P3): infer R;
  (...args: infer P4): infer R;
  (...args: infer P5): infer R;
}
  ? (...args: P1 | P2 | P3 | P4 | P5) => R
  : never;

type Overloads6<T> = T extends {
  (...args: infer P1): infer R;
  (...args: infer P2): infer R;
  (...args: infer P3): infer R;
  (...args: infer P4): infer R;
  (...args: infer P5): infer R;
  (...args: infer P6): infer R;
}
  ? (...args: P1 | P2 | P3 | P4 | P5 | P6) => R
  : never;

type Overloads7<T> = T extends {
  (...args: infer P1): infer R;
  (...args: infer P2): infer R;
  (...args: infer P3): infer R;
  (...args: infer P4): infer R;
  (...args: infer P5): infer R;
  (...args: infer P6): infer R;
  (...args: infer P7): infer R;
}
  ? (...args: P1 | P2 | P3 | P4 | P5 | P6 | P7) => R
  : never;

type Overloads8<T> = T extends {
  (...args: infer P1): infer R;
  (...args: infer P2): infer R;
  (...args: infer P3): infer R;
  (...args: infer P4): infer R;
  (...args: infer P5): infer R;
  (...args: infer P6): infer R;
  (...args: infer P7): infer R;
  (...args: infer P8): infer R;
}
  ? (...args: P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8) => R
  : never;

type Overloads9<T> = T extends {
  (...args: infer P1): infer R;
  (...args: infer P2): infer R;
  (...args: infer P3): infer R;
  (...args: infer P4): infer R;
  (...args: infer P5): infer R;
  (...args: infer P6): infer R;
  (...args: infer P7): infer R;
  (...args: infer P8): infer R;
  (...args: infer P9): infer R;
}
  ? (...args: P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9) => R
  : never;

type Overloads10<T> = T extends {
  (...args: infer P1): infer R;
  (...args: infer P2): infer R;
  (...args: infer P3): infer R;
  (...args: infer P4): infer R;
  (...args: infer P5): infer R;
  (...args: infer P6): infer R;
  (...args: infer P7): infer R;
  (...args: infer P8): infer R;
  (...args: infer P9): infer R;
  (...args: infer P10): infer R;
}
  ? (...args: P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9 | P10) => R
  : never;

type AllOverloadsUnion<T> = Overloads1<T> | Overloads2<T> | Overloads3<T> | Overloads4<T> | Overloads5<T> | Overloads6<T> | Overloads7<T> | Overloads8<T> | Overloads9<T> | Overloads10<T>;

type OverloadedParams<T> = Parameters<AllOverloadsUnion<T>>
type OverloadedReturnType<T> = ReturnType<AllOverloadsUnion<T>>

type Overloads<T> = (...args: OverloadedParams<T>) => OverloadedReturnType<T>



export type { Overloads, OverloadedParams, OverloadedReturnType };
