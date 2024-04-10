import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";

interface DisplayMediaStreamOptions {
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
  selfBroswerSurface: boolean;
}

const captureOptions: DisplayMediaStreamOptions = {
  video: true,
  audio: {
    echoCancellation: false,
    autoGainControl: false,
    noiseSuppression: false,
  },
  selfBroswerSurface: false,
};

export function LocalStreamController() {
  const [captureStream, setCaptureStream] = useState<MediaStream>();

  async function startCapture() {
    try {
      setCaptureStream(
        await navigator.mediaDevices.getDisplayMedia(captureOptions)
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function stopCapture() {
    if (!captureStream) return;
    try {
      setCaptureStream(new MediaStream());
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      {/* Only show on your own client */}
      <div className="flex justify-between items-center border-2 rounded-lg p-1 px-2 w-full max-w-full">
        {(!captureStream || (captureStream && !captureStream.active)) && (
          <div>Start Streaming</div>
        )}
        {captureStream && captureStream.active && (
          <div className="text-red-600 font-bold flex gap-1 items-center">
            LIVE
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 fill-red-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
        )}
        <div>
          {(!captureStream || !captureStream.active) && (
            <Button className="my-1" onClick={startCapture}>
              Start Stream
            </Button>
          )}
          {captureStream && captureStream.active && (
            <Button className="my-1 bg-red-700" onClick={stopCapture}>
              Stop Stream
            </Button>
          )}
        </div>
      </div>

      {/* If client starts streaming show local video playback here */}
      {captureStream && captureStream.active && (
        <VideoPlayer stream={captureStream} />
      )}
    </>
  );
}

function VideoPlayer(props: { stream: MediaStream }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Bind MediaSource to video element
    if (props.stream && videoRef.current) {
      videoRef.current.srcObject = props.stream;
    }
  }, [props.stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      controls
      className="border-2 rounded-lg object-cover aspect-video "
    />
  );
}

// function UserWindow(props: {
//   user: UserData;
//   index: number;
//   userListLength: number;
// }) {
//   const userData = props.user;
//   const index = props.index;
//   const userListLength = props.userListLength;

//   const [captureStream, setCaptureStream] = useState<MediaStream>();

//   const { user } = useUser();

//   async function startCapture() {
//     try {
//       setCaptureStream(
//         await navigator.mediaDevices.getDisplayMedia({
//           video: true,
//           audio: {
//             echoCancellation: false,
//             autoGainControl: false,
//             noiseSuppression: false,
//           },
//         })
//       );
//     } catch (error) {
//       console.error(error);
//     }
//   }

//   return (
//     <>
//       {userData && (
//         <div
//           // style={{
//           //   background: `rgb(${get_average_rgb(userData.imageURL)})`,
//           // }}
//           className={`col-span-2 ${
//             !captureStream || !captureStream.active
//               ? "px-2 py-10 md:px-4 lg:px-40"
//               : ""
//           } border-2 rounded-lg text-center align-middle ${
//             userListLength == 1 ||
//             (index === userListLength - 1 && userListLength % 2 !== 0)
//               ? "col-span-2"
//               : "md:col-span-1"
//           }`}
//         >
//           <div className="flex flex-col w-ful h-full justify-center items-center capitalize gap-1">
//             {(!captureStream || !captureStream.active) && (
//               <Avatar className="rounded-full h-24 w-24 border-4 border-purple-500">
//                 <AvatarImage
//                   className="rounded-full overflow-hidden"
//                   src={userData.imageURL}
//                   alt={userData.username}
//                   sizes="lg"
//                 />
//                 <AvatarFallback>{userData.username}</AvatarFallback>
//               </Avatar>
//             )}

//             {(!captureStream || !captureStream.active) &&
//               user &&
//               user.username === userData.username && (
//                 <>
//                   <div className="text-md">{userData.username}</div>
//                   <Button className="my-1" onClick={startCapture}>
//                     Stream
//                   </Button>
//                 </>
//               )}

//             {captureStream && captureStream.active && (
//               <VideoPlayer stream={captureStream} />
//             )}
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
