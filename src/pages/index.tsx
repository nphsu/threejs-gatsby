import React, { useEffect, createRef } from 'react'
import { Link } from 'gatsby'
import Page from '../components/Page'
import Container from '../components/Container'
import IndexLayout from '../layouts'
import BaseThreeScene from '../components/three/BaseThreeScene'

const IndexPage = () => {
  return (
    <IndexLayout>
      <BaseThreeScene />
      <Page>
        <Container>
          <h1>Hi people</h1>
          <p>Welcome to your new Gatsby site.</p>
          <p>Now go build something great.</p>
          <Link to="/page-2/">Go to page 2</Link>
        </Container>
      </Page>
    </IndexLayout>
  )
}

export default IndexPage
