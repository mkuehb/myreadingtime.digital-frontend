import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import useGoogleBooksApi from '../../hooks/useGoogleBooksApi'
import { useAuth0 } from '@auth0/auth0-react'
import Button from '../../components/Button'
import { API_BASE_URL } from '../../constants/api'
import { addToWantToRead, addToDidRead } from '../../api'
import useGetAccessToken from '../../hooks/useGetAccessToken'

import * as ui from './ui'

const ItemPage = () => {
  const { state, setUrl } = useGoogleBooksApi()
  const { id } = useParams()
  const { user, isAuthenticated, loginWithRedirect } = useAuth0()
  const accessToken = useGetAccessToken()

  const handleAddToWantToRead = (bookId, authors, thumbnail, title) => {
    addToWantToRead(bookId, authors, thumbnail, title, user.sub, accessToken)
  }

  const handleAddToDidRead = (id, authors, smallThumbnail, title) => {
    addToDidRead(id, authors, smallThumbnail, title, user.sub, accessToken)
  }

  useEffect(() => {
    setUrl(`${API_BASE_URL}/${id}`)
  }, [id, setUrl])

  const getSecureProtocol = (thumbnail) => {
    const url = thumbnail?.replace(/^http:\/\//i, 'https://')
    return url
  }

  const { isLoading, isError, data } = state

  if (isError) return <p>Oh oh! Something went wrong. Please try again!</p>

  if (isLoading) return <ui.Loading>Loading...</ui.Loading>

  return (
    <ui.Main>
      {data && (
        <>
          <h3>{data.volumeInfo.title}</h3>

          {data.volumeInfo.authors &&
            data.volumeInfo.authors.map((author) => (
              <h4 key={author}>by {author}</h4>
            ))}
          <p>{data.volumeInfo.publishedDate}</p>
          <p>{data.volumeInfo.publisher}</p>

          <p>{data.volumeInfo.pageCount} pages</p>

          {data.volumeInfo.averageRating && (
            <p>
              rating:{' '}
              {`${data.volumeInfo.averageRating}/5 (${data.volumeInfo.ratingsCount})`}
            </p>
          )}

          {data.saleInfo.listPrice && (
            <p>price: {`${data.saleInfo.listPrice.amount}€`}</p>
          )}

          {data.volumeInfo.categories && (
            <ul>
              {data.volumeInfo.categories.map((category) => (
                <li key={category}>{category}</li>
              ))}
            </ul>
          )}

          {data.volumeInfo.imageLinks &&
            data.volumeInfo.imageLinks.smallThumbnail && (
              <img
                alt={`Thumbnail of ${data.volumeInfo.title}`}
                src={getSecureProtocol(
                  data.volumeInfo.imageLinks.smallThumbnail
                )}
                loading='lazy'
              ></img>
            )}
          <p>
            <i
              dangerouslySetInnerHTML={{
                __html: data.volumeInfo.description,
              }}
            />
          </p>
          <ui.Actions>
            <Button
              onClick={
                isAuthenticated
                  ? () => {
                      const { authors, title, imageLinks } = data.volumeInfo
                      const { smallThumbnail } = imageLinks
                      handleAddToWantToRead(id, authors, smallThumbnail, title)
                    }
                  : () => loginWithRedirect()
              }
            >
              Want to read
            </Button>

            <Button
              onClick={isAuthenticated ? () => {} : () => loginWithRedirect()}
            >
              Currently reading
            </Button>

            <Button
              onClick={
                isAuthenticated
                  ? () => {
                      const { authors, title, imageLinks } = data.volumeInfo
                      const { smallThumbnail } = imageLinks
                      handleAddToDidRead(id, authors, title, smallThumbnail)
                    }
                  : () => loginWithRedirect()
              }
            >
              Read
            </Button>
          </ui.Actions>
        </>
      )}
    </ui.Main>
  )
}

export default ItemPage
