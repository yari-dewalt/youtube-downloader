// Standard queue definition with a special remove handler for specific items.
export class DownloadQueue {
  constructor() {
    this.items = [];
  }

  enqueue(item) {
    // Adds an item into the queue.
    this.items.push(item);
  }

  dequeue() {
    // Removes the item that is first in the queue.
    if (this.isEmpty())
      return "Underflow";
    return this.items.shift();
  }

  remove(item) {
    // Removes an item from the queue.
    const index = this.items.indexOf(item);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  peek() {
    // Returns the first element of the queue without removing it.
    if (this.isEmpty()) {
      return "No elements in Queue";
    }
    return this.items[0];
  }

  isEmpty() {
    // Returns true if the queue is empty.
    return this.items.length == 0;
  }

  length() {
    // Returns the length of the queue.
    return this.items.length;
  }

  printQueue() {
    // Logs the content of the queue.
    console.log(this.items);
  }
}
