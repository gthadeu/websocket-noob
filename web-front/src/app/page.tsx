"use client";
import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

type Placar = {
  [key: number]: number;
};

export default function Home() {
  const [placar, setPlacar] = useState<Placar>({
    1: 0,
    2: 0,
  });

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket: Socket = io("ws://localhost:3001");
    setSocket(newSocket);

    newSocket.on(
      "updateScores",
      ({
        scores,
      }: {
        gameId: number;
        scores: { teamId: number; score: number }[];
      }) => {
        setPlacar((currentPlacar) => {
          const newPlacar = { ...currentPlacar };
          scores.forEach((score) => {
            newPlacar[score.teamId] = score.score;
          });
          return newPlacar;
        });
      }
    );

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const incrementScore = (teamId: number) => {
    setPlacar((prevPlacar) => {
      const newPlacar = { ...prevPlacar };
      newPlacar[teamId]++;
      return newPlacar;
    });

    if (socket) {
      const scoreUpdate = {
        gameId: 1,
        teamId,
        score: placar[teamId] + 1,
      };
      socket.emit("updateScore", scoreUpdate);
    }
  };

  const decrementScore = (teamId: number) => {
    setPlacar((prevPlacar) => {
      const newPlacar = { ...prevPlacar };
      newPlacar[teamId]--;
      return newPlacar;
    });

    if (socket) {
      const scoreUpdate = {
        gameId: 1,
        teamId,
        score: placar[teamId] - 1,
      };
      socket.emit("updateScore", scoreUpdate);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center h-screen font-mono flex-col">
        <div className="mx-auto w-96 border-[#00FF00] border-2">
          <h2 className="border-b-2 border-[#00FF00] p-2 text-center text-[#00FF00] font-extrabold text-4xl">
            Scoreboard
          </h2>
          <table className="mx-auto my-4 w-full table-auto border-collapse border-[#00FF00]">
            <tbody>
              <tr>
                <td className="text-center text-4xl text-[#00FF00] font-extrabold">
                  {placar[1]}
                </td>
                <td className="text-center text-4xl text-[#00FF00] font-extrabold">
                  {placar[2]}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th className="text-center text-4xl text-[#00FF00] font-extrabold">
                  Team A
                </th>
                <th className="text-center text-4xl text-[#00FF00] font-extrabold">
                  Team B
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="gap-10 flex mt-4">
          <button
            type="button"
            className="bg-[#00FF00] p-2 font-extrabold text-xl text-black"
            onClick={() => incrementScore(1)}
          >
            + Team A
          </button>
          <button
            type="button"
            className="bg-[#00FF00] p-2 font-extrabold text-xl text-black"
            onClick={() => incrementScore(2)}
          >
            + Team B
          </button>
        </div>
        <div className="gap-10 flex mt-4">
          <button
            type="button"
            className="bg-[#00FF00] p-2 font-extrabold text-xl text-black"
            onClick={() => decrementScore(1)}
          >
            - Team A
          </button>
          <button
            type="button"
            className="bg-[#00FF00] p-2 font-extrabold text-xl text-black"
            onClick={() => decrementScore(2)}
          >
            - Team B
          </button>
        </div>
      </div>
    </>
  );
}
