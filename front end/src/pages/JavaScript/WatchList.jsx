import { useSelector } from "react-redux";
import MovieCardHorizontal from "../../components/Movies/JavaScript/MovieCardHorizontal";

export default function WatchList() {
  const watchList = useSelector((state) => state.watchList.watchListValues);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">My Watchlist</h2>
      
      {watchList.length === 0 ? (
        <div className="alert alert-info">
          Your watchlist is empty. Add some movies to watch later!
        </div>
      ) : (
        <div>
          {watchList.map((movie) => (
            <MovieCardHorizontal key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
