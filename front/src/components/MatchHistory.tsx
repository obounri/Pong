import styles from "@/styles/MatchHistory.module.css"

interface matchData {
    opponentAvatar : string ;
    opponentName : string ;
    score : string ;
    winLoss : string ;
    date : string ;
}
interface matchArray
{
    matches : matchData[];
}

function MatchCard({ opponentAvatar,opponentName, score, winLoss, date } : matchData) {
    return (
        <div className={styles.card}>
            <div className={styles.opponent}>
                <div className={styles.avatar}></div>
                <div className={styles.name}>{opponentName}</div>
            </div>
            <div className={styles.score}>{score}</div> 
            <div className={((winLoss === 'Win' ? styles.win : (winLoss === 'Result' ? styles.result : styles.loss)))} >{winLoss}</div>
            <div className={styles.date}>{date}</div>
        </div>
    )
}

export default function matchHistory({ matches } : matchArray ) {
    return (
        <div>
            <MatchCard
            opponentAvatar = ""
            opponentName = "User"
            score = "Score"
            winLoss = "Result"
            date = "Date"/>
            {matches.map( (match : matchData) => (
                <MatchCard 
                key={match.date}
                opponentAvatar = {match.opponentAvatar}
                opponentName = {match.opponentName}
                score = {match.score}
                winLoss = {match.winLoss}
                date = {match.date} 
                />
                ) )}
        </div>
    )
}