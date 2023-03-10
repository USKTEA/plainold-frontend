import { fireEvent, render, screen } from '@testing-library/react';

import { cartStore } from '../../stores/cart/CartStore';

import Item from '../../models/Item';
import Cart from './Cart';

const navigate = jest.fn();

jest.mock('react-router-dom', () => ({
  Link({ children, to }) {
    return (
      <a href={to}>
        {children}
      </a>
    );
  },
  useNavigate() {
    return navigate;
  },
}));

const context = describe;

describe('Cart', () => {
  const shirts = new Item({
    id: 1,
    productId: 1,
    price: 10_000,
    name: 'T-Shirt',
    thumbnailUrl: '1',
    shippingFee: 2_500,
    freeShippingAmount: 50_000,
    option: {
      size: 'L',
      color: 'Black',
    },
  });

  const pants = new Item({
    id: 2,
    productId: 2,
    price: 10_000,
    name: 'Pants',
    thumbnailUrl: '2',
    shippingFee: 2_500,
    freeShippingAmount: 50_000,
    option: {
      size: 'L',
      color: 'Black',
    },
  });

  beforeEach(() => {
    cartStore.reset();
    jest.clearAllMocks();
  });

  describe('CartItems', () => {
    context('Cart에 등록된 상품 없을 경우', () => {
      it('장바구니가 비어있습니다 메세지를 보여준다', () => {
        render(<Cart />);

        screen.getByText('장바구니가 비어있습니다.');
      });
    });

    context('Cart에 등록된 상품이 있을 경우', () => {
      it('Cart에 등록된 상품 정보를 보여준다', () => {
        cartStore.addItem([shirts, pants]);

        render(<Cart />);

        expect(screen.getAllByText('T-Shirt').length).toBeTruthy();
        expect(screen.getAllByText('Pants').length).toBeTruthy();
      });
    });
  });

  describe('CartSummary', () => {
    context('Cart에 등록된 상품이 없을 경우', () => {
      it('CartSummary가 보이지 않는다', () => {
        render(<Cart />);

        expect(screen.queryByText(/총 주문 상품/)).toBeFalsy();
      });
    });
  });

  describe('계속 쇼핑하기', () => {
    context('계속 쇼핑하기를 클릭했을 경우', () => {
      it('상품 페이지로 이동된다', () => {
        render(<Cart />);

        expect(screen.getByText('계속 쇼핑하기').closest('a'))
          .toHaveAttribute('href', '/products');
      });
    });
  });

  describe('수량 변경', () => {
    context('수량 변경을 클릭했을 경우', () => {
      it('수량 변경할 수 있는 모달을 볼 수 있다', () => {
        cartStore.addItem([shirts]);

        render(<Cart />);

        fireEvent.click(screen.getByRole('button', { name: '수량 변경' }));

        screen.getByRole('heading', { name: '수량 변경' });
      });
    });

    context('수량을 증가시키는 경우', () => {
      it('아이템의 수량이 증가되고 상품금액이 증가된 것을 볼 수 있다', () => {
        cartStore.addItem([shirts]);

        render(<Cart />);

        screen.getByText('1');
        screen.getByText('10,000원');

        fireEvent.click(screen.getByRole('button', { name: '수량 변경' }));

        fireEvent.click(screen.getByRole('button', { name: '+' }));

        fireEvent.click(screen.getByRole('button', { name: '변경' }));

        screen.getByText('2');
        screen.getByText('20,000원');
      });
    });

    context('수량을 감소시키는 경우', () => {
      it('아이템의 수량이 감소되고 상품금액이 감소된 것을 볼 수 있다', () => {
        cartStore.addItem([shirts, shirts]);

        render(<Cart />);

        screen.getByText('2');
        screen.getByText('20,000원');

        fireEvent.click(screen.getByRole('button', { name: '수량 변경' }));

        fireEvent.click(screen.getByRole('button', { name: '-' }));

        fireEvent.click(screen.getByRole('button', { name: '변경' }));

        screen.getByText('1');
        screen.getByText('10,000원');
      });
    });

    context('수량을 직접 변경시키는 경우', () => {
      it('아이템의 수량이 입력된 숫자만큼 변경된 것을 볼 수 있다', () => {
        cartStore.addItem([shirts]);

        render(<Cart />);

        screen.getByText('1');
        screen.getByText('10,000원');

        fireEvent.click(screen.getByRole('button', { name: '수량 변경' }));

        fireEvent.change(screen.getByLabelText('L / Black'), {
          target: {
            value: 10,
          },
        });

        fireEvent.click(screen.getByRole('button', { name: '변경' }));

        screen.getByText('10');
        screen.getByText('100,000원');
      });
    });

    context('취소를 클릭했을 경우', () => {
      it('아이템 수량과 금액이 변경되지 않은 것을 볼 수 있다', () => {
        cartStore.addItem([shirts]);

        render(<Cart />);

        screen.getByText('1');
        screen.getByText('10,000원');

        fireEvent.click(screen.getByRole('button', { name: '수량 변경' }));

        fireEvent.click(screen.getByRole('button', { name: '+' }));
        fireEvent.click(screen.getByRole('button', { name: '+' }));

        fireEvent.click(screen.getByRole('button', { name: '취소' }));

        screen.getByText('1');
        screen.getByText('10,000원');
      });
    });
  });

  describe('아이템 삭제', () => {
    it('선택한 아이템이 카트에서 삭제된 것을 볼 수 있다', () => {
      cartStore.addItem([shirts]);

      const { container } = render(<Cart />);

      expect(screen.queryByText('장바구니가 비어있습니다.')).toBeFalsy();

      fireEvent.click(container.getElementsByClassName('item-delete-button')[0]);

      expect(screen.getByText('장바구니가 비어있습니다.'));
    });
  });

  describe('옵션 삭제', () => {
    context('선텍된 아이템의 옵션이 하나 밖에 없을 경우', () => {
      it('장바구니에서 상품이 삭제된다', () => {
        const largeBlack = new Item({
          id: 1,
          productId: 1,
          price: 10_000,
          name: 'T-Shirt',
          thumbnailUrl: '1',
          shippingFee: 2_500,
          freeShippingAmount: 50_000,
          option: {
            size: 'L',
            color: 'Black',
          },
        });

        cartStore.addItem([largeBlack]);

        const { container } = render(<Cart />);

        expect(screen.getAllByText('T-Shirt').length).toBeTruthy();

        fireEvent.click(
          container.getElementsByClassName('option-delete-button')[0],
        );

        expect(screen.queryAllByText('T-Shirt').length).toBeFalsy();
      });
    });

    context('선택된 아이템의 옵션이 한 개 이상 있을 경우', () => {
      it('선택된 옵션을 삭제한다', () => {
        const largeBlack = new Item({
          id: 1,
          productId: 1,
          price: 10_000,
          name: 'T-Shirt',
          thumbnailUrl: '1',
          shippingFee: 2_500,
          freeShippingAmount: 50_000,
          option: {
            size: 'L',
            color: 'Black',
          },
        });

        const xlBlack = new Item({
          id: 1,
          productId: 1,
          price: 10_000,
          name: 'T-Shirt',
          thumbnailUrl: '1',
          shippingFee: 2_500,
          freeShippingAmount: 50_000,
          option: {
            size: 'XL',
            color: 'Black',
          },
        });

        cartStore.addItem([largeBlack, xlBlack]);

        const { container } = render(<Cart />);

        screen.getByText('L / Black - 1개');
        screen.getByText('XL / Black - 1개');

        fireEvent.click(
          container.getElementsByClassName('option-delete-button')[0],
        );

        expect(screen.queryByText('L / Black - 1개')).toBeFalsy();
      });
    });
  });

  describe('체크박스', () => {
    context('전체 선택을 체크했을 경우', () => {
      it('모든 아이템의 체크박스가 선택된 것을 볼 수 있다', () => {
        const name = 'T-Shirt';

        cartStore.addItem([shirts]);

        render(<Cart />);

        fireEvent.click(screen.getByLabelText('전체선택'));

        expect(screen.getByLabelText('전체선택')).toBeChecked();
        expect(screen.getByLabelText(name)).toBeChecked();

        screen.getByText('총 주문 상품 1개');
      });
    });

    context('아이템의 체크박스를 체크했을 경우', () => {
      it('해당 아이템의 체크박스에 체크된 것을 볼 수 있다', () => {
        const name = 'T-Shirt';

        cartStore.addItem([shirts]);

        render(<Cart />);

        fireEvent.click(screen.getByLabelText(name));

        expect(screen.getByLabelText(name)).toBeChecked();

        screen.getByText('총 주문 상품 1개');
      });
    });

    context('카트에 있는 모든 아이템을 체크했을 경우', () => {
      it('전체선택 체크박스가 체크되어 있는 것을 볼 수 있다', () => {
        cartStore.addItem([shirts, pants]);

        render(<Cart />);

        expect(screen.getByLabelText('전체선택')).not.toBeChecked();

        fireEvent.click(screen.getByLabelText('T-Shirt'));
        fireEvent.click(screen.getByLabelText('Pants'));

        expect(screen.getByLabelText('전체선택')).toBeChecked();

        screen.getByText('총 주문 상품 2개');
      });
    });

    context('카트에 있는 모든 아이템 중 하나라도 체크가 되지 않았을 경우', () => {
      it('전체선택 체크박스가 체크해제 되어 있는 것을 볼 수 있다', () => {
        cartStore.addItem([shirts, pants]);

        render(<Cart />);

        fireEvent.click(screen.getByLabelText('전체선택'));

        expect(screen.getByLabelText('전체선택')).toBeChecked();

        fireEvent.click(screen.getByLabelText('T-Shirt'));

        expect(screen.getByLabelText('전체선택')).not.toBeChecked();

        screen.getByText('총 주문 상품 1개');
      });
    });
  });

  describe('바로구매', () => {
    context('바로구매를 클릭했을 경우', () => {
      it('주문 페이지로 이동한다', () => {
        cartStore.addItem([shirts]);

        render(<Cart />);

        fireEvent.click(screen.getByRole('button', { name: '바로구매' }));

        expect(navigate).toBeCalledWith('/order');
      });
    });
  });

  describe('주문하기', () => {
    context('장바구니에서 선택한 상품이 있을 경우', () => {
      it('주문 페이지로 이동한다', () => {
        cartStore.addItem([shirts]);

        render(<Cart />);

        fireEvent.click(screen.getByLabelText('전체선택'));

        fireEvent.click(screen.getByRole('button', { name: '주문하기' }));

        expect(navigate).toBeCalledWith('/order');
      });
    });

    context('장바구니에서 선택한 상품이 없을 경우', () => {
      it('주문페이지로 이동하지 않는다', () => {
        cartStore.addItem([shirts]);

        render(<Cart />);

        expect(screen.getByLabelText('전체선택')).not.toBeChecked();

        fireEvent.click(screen.getByRole('button', { name: '주문하기' }));

        expect(navigate).not.toBeCalled();
      });
    });
  });

  describe('선택상품 삭제', () => {
    it('선택되어 있는 상품을 장바구니에서 삭제한다', () => {
      const name2 = 'Pants';

      cartStore.addItem([shirts, pants]);

      render(<Cart />);

      fireEvent.click(screen.getByLabelText(name2));

      expect(screen.getByLabelText(name2)).toBeChecked();

      fireEvent.click(screen.getByRole('button', { name: '선택상품 삭제' }));

      expect(screen.queryByText(name2)).toBeFalsy();
    });
  });
});
