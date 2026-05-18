export default class Quadtree {
  constructor(boundary, capacity = 8, depth = 0, maxDepth = 8) {
    this.boundary = boundary; // { x, z, width, height }
    this.capacity = capacity;
    this.depth = depth;
    this.maxDepth = maxDepth;
    this.points = [];
    this.divided = false;
  }

  contains(pt) {
    const b = this.boundary;
    return pt.x >= b.x && pt.x < b.x + b.width && pt.z >= b.z && pt.z < b.z + b.height;
  }

  intersects(range) {
    const a = this.boundary;
    return !(range.x > a.x + a.width || range.x + range.width < a.x ||
             range.z > a.z + a.height || range.z + range.height < a.z);
  }

  subdivide() {
    const b = this.boundary;
    const hw = b.width / 2;
    const hh = b.height / 2;
    this.nw = new Quadtree({ x: b.x, z: b.z, width: hw, height: hh }, this.capacity, this.depth + 1, this.maxDepth);
    this.ne = new Quadtree({ x: b.x + hw, z: b.z, width: hw, height: hh }, this.capacity, this.depth + 1, this.maxDepth);
    this.sw = new Quadtree({ x: b.x, z: b.z + hh, width: hw, height: hh }, this.capacity, this.depth + 1, this.maxDepth);
    this.se = new Quadtree({ x: b.x + hw, z: b.z + hh, width: hw, height: hh }, this.capacity, this.depth + 1, this.maxDepth);
    this.divided = true;
  }

  insert(item) {
    if (!this.contains(item)) return false;
    if (this.points.length < this.capacity || this.depth >= this.maxDepth) {
      this.points.push(item);
      return true;
    }
    if (!this.divided) this.subdivide();
    return this.nw.insert(item) || this.ne.insert(item) || this.sw.insert(item) || this.se.insert(item);
  }

  query(range, found = []) {
    if (!this.intersects(range)) return found;
    for (const p of this.points) {
      if (p.x >= range.x && p.x <= range.x + range.width && p.z >= range.z && p.z <= range.z + range.height) {
        found.push(p);
      }
    }
    if (this.divided) {
      this.nw.query(range, found); this.ne.query(range, found);
      this.sw.query(range, found); this.se.query(range, found);
    }
    return found;
  }
}