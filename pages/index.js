import Head from 'next/head'
import { useState, useEffect } from 'react'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import dateFormat from 'dateformat'
import { useCookies } from "react-cookie"

export default function Home({data}) {
  const [photos, setPhotos] = useState(data.photos)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(new Date())
  const [message, setMessage] = useState('')

  // Loader control
  useEffect(() => {
    if(data){
      setLoading(false)
    }
  }, [photos]);

  // Get stored cookie
  const [cookie, setCookie] = useCookies(["likes"])
  
  // Like handle function
  async function handleLike(event) {
    try {
      if(cookie.likes){
        cookie.likes.push(event.target.value)
        setCookie("likes", JSON.stringify(cookie.likes), {
          path: "/",
          maxAge: 3600, // It will expires after 1 hour
          sameSite: true,
        })
      }else{
        setCookie("likes", JSON.stringify([event.target.value]), {
          path: "/",
          maxAge: 3600, // It will expires after 1 hour
          sameSite: true,
        })
      }
    } catch (err) {
      console.log(err)
    }
  }

  // Unlike handle function
  async function handleUnlike(event) {
    const index = cookie.likes.indexOf(event.target.value)
    if (index > -1) {
      cookie.likes.splice(index, 1)
    }
    try {
      setCookie("likes", JSON.stringify(cookie.likes), {
        path: "/",
        maxAge: 3600, // It will expires after 1 hour
        sameSite: true,
      })
    } catch (err) {
      console.log(err)
    }
  }

  // Date change handle function
  async function dateChange(date){
    setStartDate(date)
    setLoading(true)
    let fromDate = dateFormat(date, 'yyyy-mm-dd')
    const res = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=${fromDate}&api_key=sHHsWDwfgpTwUJHNnsVJtq8j4zsQi1FXs9BRPL21`)
    const newData = await res.json()
    if (!newData || newData.photos.length == 0) {
      setPhotos([])
      setLoading(false)
      setMessage('No results found')
    }else{
      setPhotos(newData.photos)
      setLoading(false)
      setMessage('')
    }
  }

  return (
    <>
    <Head>
      <title>NASA Mars Rover Photos</title>
    </Head>
    <nav className="flex items-center justify-between flex-wrap bg-blue-500 p-6 pl-12">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
      <img src="logo.png" width="50" />  
      <span className="font-semibold text-xl tracking-tight">Nasa</span>
      </div>
    </nav>
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">NASA</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Spacetagram
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Brought to you by NASA's image API
          </p>
        </div>
      </div>
    </div>
    <div className="bg-white">
      <div className="max-w-7xl">
        <div>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 px-4">
            Filter photos by date
          </p>
        </div>
      </div>
    </div>
    <div className="grid gap-4 grid-cols-4 m-4 p-4 border border-gray-500">
      <div>
        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Earth Date</h2>
        <DatePicker selected={startDate} onChange={(date) => dateChange(date)} />
      </div>
    </div>
    {
      // No results message box
      message ? 
      <div className="bg-white">
        <div className="max-w-7xl">
          <div>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 px-4">
              {message}
            </p>
          </div>
        </div>
      </div>
      : ''
    }
    {
      !loading ? // Loader Animation
      <div className="grid gap-4 grid-cols-4 p-4">
      {
        // loop for photos and data
        photos.map((photo, index) => (
            <div className="rounded overflow-hidden shadow-lg" key={index}>
              <img className="w-full" src={photo.img_src} alt={`${photo.rover.name} - ${photo.camera.full_name}`} />
              <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">{photo.rover.name} - {photo.camera.full_name}</div>
                <p className="text-gray-700 text-base">
                  Date: {photo.earth_date}
                </p>
              </div>
              <div className="px-6 pt-4 pb-2">
                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#{photo.rover.name.replace(/\s/g, '')}</span>
                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#{photo.camera.name.replace(/\s/g, '')}</span>
                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#{photo.camera.full_name.replace(/\s/g, '')}</span>
              </div>
              <div className="px-6 pt-4 pb-4">
                {
                  // Conditions for liked photos
                  cookie.likes ? cookie.likes.includes(photo.img_src) ?
                  <button onClick={handleUnlike} value={photo.img_src} className="bg-black hover:bg-transparent hover:text-gray-800 font-semibold text-white py-2 px-4 border border-gray-500 hover:border-transparent rounded">
                    Liked
                  </button>
                  :
                  <button onClick={handleLike} value={photo.img_src} className="bg-transparent hover:bg-black text-gray-800 font-semibold hover:text-white py-2 px-4 border border-gray-500 hover:border-transparent rounded">
                    Like
                  </button>
                  :
                  <button onClick={handleLike} value={photo.img_src} className="bg-transparent hover:bg-black text-gray-800 font-semibold hover:text-white py-2 px-4 border border-gray-500 hover:border-transparent rounded">
                    Like
                  </button>

                }
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${photo.img_src}`} target="_blank">
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 ml-2 px-4 border border-gray-500 hover:border-transparent rounded">
                  Share on Facebook
                </button>
                </a>
              </div>
            </div>
        ))
      }
      </div>
      :
      <div className="w-full">
        <img className="m-auto" src="loading.gif" />
      </div>
    }
    </>
  )
}


export async function getServerSideProps() {
  let fromDate = dateFormat(new Date(), 'yyyy-mm-dd')
  const res = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=${fromDate}&api_key=sHHsWDwfgpTwUJHNnsVJtq8j4zsQi1FXs9BRPL21`)
  const data = await res.json()

  if (!data) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      data // will be passed to the page component as props
    }
  }
}
