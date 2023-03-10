import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import useCreateOrderStore from '../../hooks/useCreateOrderStore';

import defaultTheme from '../../styles/defaultTheme';

import numberFormat from '../../utils/numberFormat';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2em 5em;
  height: 100vh;
  width: 100%;
  max-width: 1400px;
  background: ${defaultTheme.colors.background};
`;

const Wrapper = styled.div`
  width: 35%;
`;

const Title = styled.h1`
  display: flex;
  height: 3em;
  font-size: 1.3em;
  justify-content: center;
  align-items: center;
`;

const Message = styled.div`
  margin-bottom: 2em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  p {
    margin-bottom: .3em;
    font-weight: 600;
    color: ${defaultTheme.colors.fifth};
  }
`;

const Table = styled.table`
  width: 100%;
  font-size: 1em;
  background-color: white;

  span {
    display: block;
    margin-bottom: .2em;
  }

  th, td {
    font-size: .8em;
    text-align: left;
    padding: 1.2em 0 1em 1.2em;
  }

  th{
    color: ${defaultTheme.colors.third};
  }

  tr {
    height: 2em;
    border-bottom: 1px solid ${defaultTheme.colors.fourth};
  }

  tr:last-child {
    border-bottom: none;
  }

  strong {
    font-weight: 700;
    color: ${defaultTheme.colors.primary};
    }
`;

const HomeButton = styled(Link)`
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
  :hover {
    background-color: ${defaultTheme.colors.primaryText}
  }
`;

export default function OrderResult() {
  const navigate = useNavigate();

  const createOrderStore = useCreateOrderStore();

  const { result, processing } = createOrderStore;

  const { paymentMethod } = result;

  useEffect(() => {
    if (!result) {
      navigate('/error');
    }
  }, []);

  if (processing) {
    return <Message>now loading...</Message>;
  }

  if (!result) {
    return <Message>????????? ???????????????</Message>;
  }

  return (
    <Container>
      <Wrapper>
        <Title>????????????</Title>
        {paymentMethod === 'CASH' ? (
          <Message>
            <p>?????? ??????????????? ????????? ?????????</p>
            <p>
              ?????? ??????????????? ?????????
            </p>
          </Message>
        ) : null}
        {paymentMethod === 'KAKAOPAY'
          ? (
            <Message>
              <p>???????????? ??? ?????? ????????? ???????????????.</p>
            </Message>
          ) : null}
        <Table>
          <tbody>
            {paymentMethod === 'CASH' ? (
              <tr>
                <th>???????????? ??????</th>
                <td>
                  <span>
                    ????????????
                  </span>
                  <span>
                    1005-003-623814
                  </span>
                  <span>
                    ?????????
                  </span>
                  <strong>
                    {`${numberFormat(result.cost)}???`}
                  </strong>
                  <br />
                </td>
              </tr>
            ) : null}
            {paymentMethod === 'KAKAOPAY' ? (
              <tr>
                <th>????????????</th>
                <td>
                  <span>
                    ???????????????
                  </span>
                  <span>-</span>
                  <strong>
                    ?????? ??????
                    {' '}
                    {`${numberFormat(result.cost)}???`}
                  </strong>
                  <br />
                </td>
              </tr>
            ) : null}
            <tr>
              <th>????????????</th>
              <td>
                <strong>
                  {result.orderNumber}
                </strong>
              </td>
            </tr>
            <tr>
              <th>?????????</th>
              <td>
                <span>
                  {result.receiver.name}
                </span>
                <span>
                  {result.receiver.phoneNumber}
                </span>
                <span>
                  {result.shippingAddress.address1}
                </span>
                <span>
                  {result.shippingAddress.address2}
                </span>
                <span>
                  {`(${result.shippingAddress.zipCode})`}
                </span>
              </td>
            </tr>
          </tbody>
        </Table>
        <div>
          <HomeButton to="/">?????????</HomeButton>
        </div>
      </Wrapper>
    </Container>
  );
}
