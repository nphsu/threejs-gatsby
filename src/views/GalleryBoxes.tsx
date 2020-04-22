import React from 'react'
import { useStaticQuery, Link, graphql } from 'gatsby'
import Img from 'gatsby-image'

interface Props {
  images: any
}

const MiscLookAtBox = (props: Props) => {
  return (
    <>
      <Img fixed={props.images} className="bg-no-repeat content-center w-full h-full" />
    </>
  )
}

const PointWaveBox = (props: Props) => {
  return (
    <>
      <Img fixed={props.images} className="bg-no-repeat content-center w-full h-full" />
    </>
  )
}
const ClippingAdvancedBox = (props: Props) => {
  return (
    <>
      <Img fixed={props.images} className="bg-no-repeat content-center w-full h-full" />
    </>
  )
}

const GalleryBoxes = () => {
  const data = useStaticQuery(graphql`
    query {
      miscLookat: file(relativePath: { eq: "scenes/misc-lookat.png" }) {
        childImageSharp {
          fixed(width: 100, height: 100) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      pointWave: file(relativePath: { eq: "scenes/point-wave.png" }) {
        childImageSharp {
          fixed(width: 100, height: 100) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      clippingAdvanced: file(relativePath: { eq: "scenes/clipping-advanced.png" }) {
        childImageSharp {
          fixed(width: 100, height: 100) {
            ...GatsbyImageSharpFixed
          }
        }
      }
    }
  `)
  return (
    <>
      <Link to="/misc-lookat/">
        <MiscLookAtBox images={data.miscLookat.childImageSharp.fixed} />
      </Link>
      <Link to="/point-wave/">
        <PointWaveBox images={data.pointWave.childImageSharp.fixed} />
      </Link>
      <Link to="/clipping-advanced">
        <ClippingAdvancedBox images={data.clippingAdvanced.childImageSharp.fixed} />
      </Link>
    </>
  )
}

export default GalleryBoxes
