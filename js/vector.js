export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v) {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  mult(n) {
    this.x *= n;
    this.y *= n;
    return this;
  }

  div(n) {
    this.x /= n;
    this.y /= n;
    return this;
  }

  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  setMag(n) {
    const m = this.mag();
    if (m === 0) return this;
    return this.mult(n / m);
  }

  limit(max) {
    if (this.mag() > max) this.setMag(max);
    return this;
  }

  normalize() {
    const m = this.mag();
    if (m === 0) return new Vector2(0, 0);
    return new Vector2(this.x / m, this.y / m);
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  heading() {
    return Math.atan2(this.y, this.x);
  }

  copy() {
    return new Vector2(this.x, this.y);
  }

  static random2D() {
    const a = Math.random() * Math.PI * 2;
    return new Vector2(Math.cos(a), Math.sin(a));
  }
}
