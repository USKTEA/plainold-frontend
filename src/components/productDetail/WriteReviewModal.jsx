import { useEffect, useRef, useState } from 'react';

import styled from 'styled-components';
import defaultTheme from '../../styles/defaultTheme';

import useGetReviewStore from '../../hooks/useGetReviewStore';
import useCreateReviewStore from '../../hooks/useCreateReviewStore';
import useProductStore from '../../hooks/useProductStore';
import useGetOrderStore from '../../hooks/useGetOrderStore';
import useReviewImageFileStore from '../../hooks/useReviewImageFileStore';

import Rating from './Rating';

const Container = styled.div`
  position: absolute;
  width: 120%;
  height: 275em;
  top: -10em;
  left: -10em;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 999;
`;

const Wrapper = styled.div`
  top: 50%;
  left: 50%;
  transform: translate(-0%, 50%);
  height: 38em;
  width: 24em;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  border-radius: 3px;
  background-color: white;
`;

const SubWrapper = styled.div`
  width: 100%;
  padding: 1em;
  display: flex;
  flex-direction: column;
`;

const Title = styled.label`
  height: 3em;
  font-size: .9em;
  width: 100%;
  padding-top: 1em;
  padding-bottom: 1em;
  text-align: center;
  border-bottom: 1px solid ${defaultTheme.colors.fourth};
`;

const Item = styled.div`
  font-size: .9em;
  width: 100%;
  margin-bottom: .5em;
  border: 1px solid ${defaultTheme.colors.fourth};
  display: flex;
  align-items: center;
`;

const ImageContainer = styled.div`
  width: 4em;
  height: 4em;
  padding: .5em;
  margin-right: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid ${defaultTheme.colors.fourth};
`;

const RateWrapper = styled.div`
  height: 7em;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  span {
    font-weight: 700;
    margin-bottom: 1em;
  }

  div {
    font-size: 2em;
  }
`;

const ReviewForm = styled.textarea`
    font-size: .9em;
    height: 15em;
    margin-bottom: 1em;
    padding: 1em;
    border: 1px solid ${defaultTheme.colors.fourth};
    color: ${defaultTheme.colors.primaryText};
    resize: none;
    :focus {
      outline: 1px solid ${defaultTheme.colors.fifth};
    }
`;

const ImageUpload = styled.div`
  margin-top: 1em;
  display: flex;
  flex-direction: column;

  span {
    font-size: .8em;
    font-weight: 300;
  }

  label {
    font-weight: 100;
    font-size: 3em;
    height: 1.5em;
    width: 1.5em;
    margin-top: .3em;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid ${defaultTheme.colors.fourth};
    color: ${defaultTheme.colors.fifth};
    background-color: #f8f8f8;
    cursor: pointer;
  }

  input {
    display: none;
  }
`;

const Preview = styled.div`
  margin-top: 1em;
  height: 4.4em;
  width: 30%;
  display: flex;

  img {
    height: 67px;
    width: 67px
  }
`;

const DeleteImage = styled.button`
  height: 18px;
  width: 18px;
  margin-left: .2em;
  display: flex;
  text-align: center;
  vertical-align: middle;
  background-color: ${defaultTheme.colors.fourth};
  color: white;
  border: none;
  cursor: pointer;
  :hover {
    background-color: ${defaultTheme.colors.fifth};
  }
`;

const Submit = styled.button`
  height: 3em;
  width: 100%;
  border: none;
  background-color: ${defaultTheme.colors.primary};
  color: white;
  cursor: pointer;
`;

const ErrorMessage = styled.strong`
  font-size: .7em;
  text-align: end;
  color: ${defaultTheme.colors.red};
`;

export default function WriteReviewModal({ setModalOpen }) {
  const modalRef = useRef(null);
  const [currentImage, setCurrentImage] = useState(null);

  const reviewImageFileStore = useReviewImageFileStore();
  const productStore = useProductStore();
  const getReviewStore = useGetReviewStore();
  const getOrderStore = useGetOrderStore();
  const createReviewStore = useCreateReviewStore();

  const handler = ({ target }) => {
    if (modalRef.current && !modalRef.current.contains(target)) {
      setModalOpen(((previous) => !previous));
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handler);

    return () => {
      createReviewStore.clear();
      reviewImageFileStore.clear();
      document.removeEventListener('mousedown', handler);
    };
  }, []);

  const { product } = productStore;
  const { review } = createReviewStore;
  const { orderNumber } = getOrderStore;

  const handleChangeComment = (comment) => {
    createReviewStore.changeComment({ comment });
  };

  const handleChangeRate = (rate) => {
    createReviewStore.changeRate(rate);
  };

  const handleAddImage = (event) => {
    const image = event.target.files[0];
    const currentImageURL = URL.createObjectURL(image);

    reviewImageFileStore.addFile(image);

    setCurrentImage(currentImageURL);
  };

  const handleDeleteImage = () => {
    reviewImageFileStore.deleteFile();

    setCurrentImage(null);
  };

  const handleSubmitReview = async () => {
    if (reviewImageFileStore.hasFilesToUpload()) {
      await reviewImageFileStore.upload();
    }

    if (reviewImageFileStore.errors.upload) {
      return;
    }

    const { url } = reviewImageFileStore;

    await createReviewStore.submitReview(
      { orderNumber, productId: product.id, imageUrl: url },
    );

    const { reviewId } = createReviewStore;

    if (reviewId) {
      getOrderStore.clear();
      reviewImageFileStore.clear();
      getReviewStore.fetchReviews({ productId: product.id, pageNumber: 1 });
      setModalOpen((previous) => !previous);
    }
  };

  return (
    <Container>
      <Wrapper ref={modalRef}>
        <Title
          htmlFor="comment"
        >
          구매평 작성
        </Title>
        <SubWrapper>
          <Item>
            <ImageContainer>
              <img
                src={product.image.thumbnailUrl}
                alt={product.name}
                height={45}
                width={45}
              />
            </ImageContainer>
            <span>{product.name}</span>
          </Item>
          <RateWrapper>
            <span>상품은 어떠셨나요?</span>
            <Rating review={review} changeRate={handleChangeRate} />
          </RateWrapper>
          <ReviewForm
            name="review"
            id="comment"
            placeholder="어떤 점이 좋으셨나요?"
            cols="30"
            rows="10"
            value={review.comment}
            onChange={(e) => handleChangeComment(e.target.value)}
          />
          {createReviewStore.hasError() || reviewImageFileStore.errors.upload
            ? (
              <ErrorMessage>
                {reviewImageFileStore.errors.upload || createReviewStore.getError()}
              </ErrorMessage>
            )
            : null}
          <ImageUpload>
            <span>사진 첨부</span>
            {currentImage
              ? (
                <Preview>
                  <img
                    src={currentImage}
                    alt="이미지 미리보기"
                  />
                  <DeleteImage
                    type="button"
                    onClick={handleDeleteImage}
                  >
                    x
                  </DeleteImage>
                </Preview>
              )
              : (
                <>
                  <label htmlFor="input-file">+</label>
                  <input
                    id="input-file"
                    name="file"
                    type="file"
                    onChange={handleAddImage}
                  />
                </>
              )}
          </ImageUpload>
        </SubWrapper>
        <Submit
          type="button"
          onClick={handleSubmitReview}
        >
          등록
        </Submit>
      </Wrapper>
    </Container>
  );
}
