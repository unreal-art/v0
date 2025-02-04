export default function LandingSlider () {

    return (
        <>
            <div className="scene">
                <div className="carousel">
                    <div className="carousel__cell">1</div>
                    <div className="carousel__cell">2</div>
                    <div className="carousel__cell">3</div>
                    <div className="carousel__cell">4</div>
                    <div className="carousel__cell">5</div>
                    <div className="carousel__cell">6</div>
                    <div className="carousel__cell">7</div>
                    <div className="carousel__cell">8</div>
                    <div className="carousel__cell">9</div>
                    <div className="carousel__cell">10</div>
                    <div className="carousel__cell">11</div>
                    <div className="carousel__cell">12</div>
                    <div className="carousel__cell">13</div>
                    <div className="carousel__cell">14</div>
                    <div className="carousel__cell">15</div>
                </div>
            </div>

            <div className="carousel-options">
                <p>
                    <label>
                    Cells
                    <input className="cells-range" type="range" min="3" max="15" value="9" />
                    </label>
                </p>
                <p>
                    <button className="previous-button">Previous</button>
                    <button className="next-button">Next</button>
                </p>
            </div>
        </>
    )
}