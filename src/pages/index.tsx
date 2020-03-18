import React, { useEffect, createRef } from 'react'
import { Link } from 'gatsby'
import Page from '../components/Page'
import Container from '../components/Container'
import IndexLayout from '../layouts'
import BaseThreeScene from '../components/three/BaseThreeScene'
// Custom Scene
// import MultiThreeScene from '../components/three/MultiThreeScene'
import GradientScene from '../components/three/GradientScene'

const IndexPage = () => {
  return (
    <IndexLayout>
      <GradientScene />
      {/* <BaseThreeScene /> */}
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
