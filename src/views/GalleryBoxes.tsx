import React from 'react'
import { useStaticQuery, Link, graphql } from 'gatsby'
import Img from 'gatsby-image'

interface Props {
  images: any
}

const ImageSceneBox = (props: Props) => {
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
      animationCloth: file(relativePath: { eq: "scenes/animation-cloth.png" }) {
        childImageSharp {
          fixed(width: 100, height: 100) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      attributePoint: file(relativePath: { eq: "scenes/attribute-point.png" }) {
        childImageSharp {
          fixed(width: 100, height: 100) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      skinningMorph: file(relativePath: { eq: "scenes/skinning-morph.png" }) {
        childImageSharp {
          fixed(width: 100, height: 100) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      animationGroup: file(relativePath: { eq: "scenes/animation-group.png" }) {
        childImageSharp {
          fixed(width: 100, height: 100) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      rollercoaster: file(relativePath: { eq: "scenes/rollercoaster.png" }) {
        childImageSharp {
          fixed(width: 100, height: 100) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      css3dSprite: file(relativePath: { eq: "scenes/css3d-sprite.png" }) {
        childImageSharp {
          fixed(width: 100, height: 100) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      attributePoint2: file(relativePath: { eq: "scenes/attribute-point2.png" }) {
        childImageSharp {
          fixed(width: 100, height: 100) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      crossfade: file(relativePath: { eq: "scenes/crossfade.png" }) {
        childImageSharp {
          fixed(width: 100, height: 100) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      drawRange: file(relativePath: { eq: "scenes/draw-range.png" }) {
        childImageSharp {
          fixed(width: 100, height: 100) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      ocean: file(relativePath: { eq: "scenes/ocean.png" }) {
        childImageSharp {
          fixed(width: 100, height: 100) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      gltf: file(relativePath: { eq: "scenes/gltf.png" }) {
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
        <ImageSceneBox images={data.miscLookat.childImageSharp.fixed} />
      </Link>
      <Link to="/point-wave/">
        <ImageSceneBox images={data.pointWave.childImageSharp.fixed} />
      </Link>
      <Link to="/clipping-advanced">
        <ImageSceneBox images={data.clippingAdvanced.childImageSharp.fixed} />
      </Link>
      <Link to="/animation-cloth">
        <ImageSceneBox images={data.animationCloth.childImageSharp.fixed} />
      </Link>
      <Link to="/attribute-point">
        <ImageSceneBox images={data.attributePoint.childImageSharp.fixed} />
      </Link>
      <Link to="/skinning-morph">
        <ImageSceneBox images={data.skinningMorph.childImageSharp.fixed} />
      </Link>
      <Link to="/animation-group">
        <ImageSceneBox images={data.animationGroup.childImageSharp.fixed} />
      </Link>
      <Link to="/rollercoaster">
        <ImageSceneBox images={data.rollercoaster.childImageSharp.fixed} />
      </Link>
      <Link to="/css3d-sprite">
        <ImageSceneBox images={data.css3dSprite.childImageSharp.fixed} />
      </Link>
      <Link to="/attribute-point2">
        <ImageSceneBox images={data.attributePoint2.childImageSharp.fixed} />
      </Link>
      <Link to="/crossfade">
        <ImageSceneBox images={data.crossfade.childImageSharp.fixed} />
      </Link>
      <Link to="/draw-range">
        <ImageSceneBox images={data.drawRange.childImageSharp.fixed} />
      </Link>
      <Link to="/ocean">
        <ImageSceneBox images={data.ocean.childImageSharp.fixed} />
      </Link>
      <Link to="/gltf">
        <ImageSceneBox images={data.gltf.childImageSharp.fixed} />
      </Link>
    </>
  )
}

export default GalleryBoxes
