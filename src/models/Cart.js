import Item from './Item';

export default class Cart {
  constructor(items = new Map()) {
    this.items = items;
  }

  generateId() {
    const items = [...this.items.keys()]
      .reduce(
        (acc, name) => [...acc, ...this.items.get(name)],
        [],
      );

    const id = Math.max(0, ...items.map((item) => item.id)) + 1;

    return id;
  }

  addItem(item) {
    const { name } = item;
    const { quantity } = item;
    const index = this.findIndex(name, item);

    return index < 0
      ? this.insertItem(name, item)
      : this.updateItem(name, index, quantity);
  }

  insertItem(name, item) {
    if (this.items.size === 0) {
      return new Cart(
        new Map().set(name, [
          { ...item, id: this.generateId() },
        ]),
      );
    }

    if (this.items.get(name)) {
      const items = [...this.items.keys()].reduce((acc, i) => {
        if (name === i) {
          return acc.set(
            name,
            [...this.items.get(name), { ...item, id: this.generateId() }],
          );
        }

        return acc.set(i, [...this.items.get(i)]);
      }, new Map());

      return new Cart(items);
    }

    const items = [...this.items.keys()]
      .reduce((acc, i) => acc.set(i, [...this.items.get(i)]), new Map());

    items.set(name, [{ ...item, id: this.generateId() }]);

    return new Cart(items);
  }

  updateItem(name, index, quantity) {
    const items = [...this.items.keys()].reduce((acc, i) => {
      if (i === name) {
        const founds = this.items.get(name);

        return acc.set(
          name,
          [...founds.slice(0, index),
            new Item({
              ...founds[index],
              quantity: founds[index].quantity + quantity,
            }),
            ...founds.slice(index + 1)],
        );
      }

      return acc.set(i, [...this.items.get(i)]);
    }, new Map());

    return new Cart(items);
  }

  findIndex(name, item) {
    const founds = this.items.get(name);

    if (!founds) {
      return -1;
    }

    if (!item.option) {
      return 0;
    }

    const index = founds.findIndex((i) => {
      const option1 = i.option;
      const option2 = item.option;

      return option1.size === option2.size && option1.color === option2.color;
    });

    return index;
  }

  update({ name, items }) {
    return new Cart(
      [...this.items.keys()].reduce((acc, i) => {
        if (i === name) {
          return acc.set(name, items);
        }

        return acc.set(i, [...this.items.get(i)]);
      }, new Map()),
    );
  }

  deleteItem({ name }) {
    return new Cart(
      [...this.items.keys()].reduce((acc, i) => {
        if (i === name) {
          return acc;
        }

        return acc.set(i, [...this.items.get(i)]);
      }, new Map()),
    );
  }

  deleteOption({ id, name }) {
    const items = this.items.get(name);

    if (items.length === 1) {
      return this.deleteItem({ name });
    }

    const index = items.findIndex((i) => i.id === id);

    const deleted = [...this.items.keys()].reduce((acc, i) => {
      if (i === name) {
        return acc.set(
          i,
          [...items.slice(0, index), ...items.slice(index + 1)],
        );
      }

      return acc.set(i, [...this.items.get(i)]);
    }, new Map());

    return new Cart(deleted);
  }

  shippingFee({ name }) {
    const items = this.items.get(name);
    const amount = items.reduce((acc, i) => acc + i.totalPrice, 0);
    const { freeShippingAmount } = items[0];

    return amount >= freeShippingAmount
      ? 0
      : items[0].shippingFee;
  }

  checkHasOption({ name }) {
    const { option } = this.items.get(name)[0];

    return !!option && !(option.color === '' && option.size === 'FREE');
  }

  itemQuantity({ name }) {
    const founds = this.items.get(name);

    return founds.reduce((acc, i) => acc + i.quantity, 0);
  }

  totalQuantity() {
    return this.items.size;
  }

  totalCost() {
    if (this.items.size === 0) {
      return 0;
    }

    const items = [...this.items.keys()]
      .reduce(
        (acc, name) => [...acc, ...this.items.get(name)],
        [],
      );

    return items.reduce((acc, item) => acc + item.totalPrice, 0);
  }

  itemPrice({ name }) {
    const founds = this.items.get(name);

    return founds.reduce((acc, i) => acc + i.totalPrice, 0);
  }
}
