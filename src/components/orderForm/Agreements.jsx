import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { useLocalStorage } from 'usehooks-ts';
import useOrderFromStore from '../../hooks/useOrderFomStore';
import useOrderItemStore from '../../hooks/useOrderItemStore';
import useCreateOrderStore from '../../hooks/useCreateOrderStore';

import defaultTheme from '../../styles/defaultTheme';

import InputLabel from '../ui/InputLabel';
import SubSection from '../ui/Subsection';
import useCartStore from '../../hooks/useCartStore';
import usePaymentStore from '../../hooks/usePaymentStore';

const Checkbox = styled.div`
  li {
    display: flex;
    margin-left: .5em;
  }

  li::before {
    content: 'ㄴ';
    display: inline-block;
    color: ${defaultTheme.colors.fourth};
    margin-right: .2em;
  }
`;

const OrderButton = styled.button`
  font-size: 0.8em;
  width: 100%;
  height: 3em;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${defaultTheme.colors.secondary};
  color: white;
  cursor: pointer;
  :disabled {
    :active {
      background-color: ${defaultTheme.colors.red};
    }
  }

  :hover {
    background-color: ${defaultTheme.colors.primary}
  }
`;

export default function Agreements() {
  const navigate = useNavigate();
  const [, setCartItems] = useLocalStorage('cartItems', '');
  const [, setOrderInformation] = useLocalStorage('orderInformation', '');

  const orderFormStore = useOrderFromStore();
  const orderItemStore = useOrderItemStore();
  const createOrderStore = useCreateOrderStore();
  const cartStore = useCartStore();
  const paymentStore = usePaymentStore();

  const { agreements, fields: { paymentMethod } } = orderFormStore;
  const { orderer, shippingInformation, payment } = orderFormStore.form();
  const { orderItems } = orderItemStore;

  const handleCashOrder = async () => {
    if (orderFormStore.isComplete()) {
      await createOrderStore.createOrder({
        orderItems: orderItems.getItems(),
        orderer,
        shippingInformation,
        payment,
      });

      const { result } = createOrderStore;

      if (!result) {
        navigate('/order-failure');

        return;
      }

      cartStore.completePurchase();

      const { items } = cartStore.cart;

      setCartItems([...items.values()]);

      navigate('/order-success');
    }
  };

  const handleKakaoOrder = async () => {
    if (orderFormStore.isComplete()) {
      const redirectUrl = await paymentStore.getReadyPayment(
        { provider: paymentMethod, orderItems: orderItems.getItems() },
      );

      if (redirectUrl) {
        setOrderInformation({
          paymentProvider: paymentStore.paymentProvider,
          prePaymentId: paymentStore.prePaymentId,
          partnerOrderId: paymentStore.partnerOrderId,
          orderItems: orderItems.getItems(),
          orderer,
          shippingInformation,
          payment,
        });

        window.location.href = redirectUrl;
      }
    }
  };

  const orderOptions = {
    CASH: handleCashOrder,
    KAKAOPAY: handleKakaoOrder,
  };

  return (
    <SubSection>
      <Checkbox>
        <InputLabel>
          <input
            id="agree-all-agreements"
            type="checkbox"
            name="agree-all-agreements"
            checked={agreements.privacyAgreement && agreements.purchaseAgreement}
            onClick={() => orderFormStore.toggleAgreeAll()}
            readOnly
          />
          <label htmlFor="agree-all-agreements">전체 동의</label>
        </InputLabel>
        <ul>
          <li>
            <InputLabel>
              <input
                className="agreement"
                id="privacy-agreement"
                type="checkbox"
                name="privacy-agreement"
                value="agree"
                checked={agreements.privacyAgreement}
                onClick={() => orderFormStore.toggleAgreement('privacyAgreement')}
                readOnly
              />
              <label htmlFor="privacy-agreement">
                개인정보 수집 및 이용 동의 약관보기
              </label>
            </InputLabel>
          </li>
          <li>
            <InputLabel>
              <input
                className="agreement"
                id="purchase-agreement"
                type="checkbox"
                name="purchase-agreement"
                value="agree"
                checked={agreements.purchaseAgreement}
                onClick={() => orderFormStore.toggleAgreement('purchaseAgreement')}
                readOnly
              />
              <label htmlFor="purchase-agreement">
                구매조건 확인 및 결제진행에 동의
              </label>
            </InputLabel>
          </li>
        </ul>
      </Checkbox>
      <OrderButton
        disabled={!orderFormStore.isComplete()}
        onClick={orderOptions[`${paymentMethod}`]}
      >
        결제하기
      </OrderButton>
    </SubSection>
  );
}
