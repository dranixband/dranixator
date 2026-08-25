import Board from './components/Board'
import LiveChat from './components/livechat/LiveChat'
import { AchievementsProvider } from './achievements/AchievementsProvider'
import AchievementToaster from './components/achievements/AchievementToaster'
import AchievementsButton from './components/achievements/AchievementsButton'
import AchievementsPanel from './components/achievements/AchievementsPanel'

function App() {
  return (
    <AchievementsProvider>
      <Board />
      <LiveChat />
      <AchievementsButton />
      <AchievementToaster />
      <AchievementsPanel />
    </AchievementsProvider>
  )
}

export default App
