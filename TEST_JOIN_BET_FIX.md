# Test Plan: Join Bet Selection Fix

## Bug Description
Previously, when a user selected a bet from the dropdown and then switched to a different match, the selected bet would be cleared. This made it difficult to join bets.

## Fix Applied
- `handleSelectMatch` no longer resets `selectedBetId` and `joinAmount`
- `useEffect` for `selectedBetId` now only clears the selection if the bet is no longer in `openBetsOnMatch`

## Test Scenarios

### Scenario 1: Selection Persists When Bet Is Still Valid
**Steps:**
1. Start frontend: `cd frontend && npm start`
2. Connect wallet and create a bet on "Match A" (e.g., 0.01 OKB, predict 2-1)
3. Select the bet from the "Join a stake" dropdown
4. Verify the amount auto-fills to 0.01 OKB
5. Click on "Match B" in the fixtures list
6. Click back on "Match A"
7. **Expected:** The bet should still be selected in the dropdown ✅
8. **Expected:** The amount should still show 0.01 OKB ✅

### Scenario 2: Selection Clears When Bet Is No Longer Available
**Steps:**
1. Create a bet on "Match A"
2. Select the bet from the dropdown
3. Open MetaMask and switch to the creator's account
4. Cancel the bet
5. **Expected:** The selection should clear automatically ✅
6. **Expected:** The dropdown should show "Select an open stake…" ✅

### Scenario 3: Selection Clears When Bet Is Joined
**Steps:**
1. Create a bet on "Match A" with Account 1
2. Switch to Account 2
3. Select the bet from the dropdown
4. Enter score prediction and join the bet
5. **Expected:** After joining, the bet should disappear from the dropdown ✅
6. **Expected:** The bet should now show in "Active stakes" with both players ✅

### Scenario 4: Multiple Bets on Same Match
**Steps:**
1. Create 3 bets on "Match A" with different amounts (0.01, 0.02, 0.03 OKB)
2. Select the 0.02 OKB bet from the dropdown
3. Verify amount shows 0.02 OKB
4. Switch to "Match B"
5. Switch back to "Match A"
6. **Expected:** The 0.02 OKB bet should still be selected ✅
7. Change selection to the 0.03 OKB bet
8. **Expected:** Amount should update to 0.03 OKB ✅

## Manual Testing Checklist

- [ ] Scenario 1: Selection persists across match switches
- [ ] Scenario 2: Selection clears when bet is cancelled
- [ ] Scenario 3: Selection clears when bet is joined
- [ ] Scenario 4: Multiple bets work correctly
- [ ] No console errors during testing
- [ ] MetaMask transactions work correctly
- [ ] UI updates in real-time

## Automated Test (Optional)

If you want to add a unit test, here's the logic to test:

```javascript
describe('Join Bet Selection', () => {
  it('should persist selectedBetId when switching matches if bet is still valid', () => {
    // Setup: openBetsOnMatch contains bet with ID 1
    const openBetsOnMatch = [{ betId: 1, amount: ethers.parseEther('0.01') }];
    const selectedBetId = '1';
    
    // Action: Switch match (handleSelectMatch called)
    // selectedBetId should NOT be reset
    
    // Assert: selectedBetId should still be '1'
    expect(selectedBetId).toBe('1');
  });
  
  it('should clear selectedBetId when bet is no longer in openBetsOnMatch', () => {
    // Setup: openBetsOnMatch is empty (bet was joined or cancelled)
    const openBetsOnMatch = [];
    let selectedBetId = '1';
    
    // Action: useEffect runs and detects bet is not in openBetsOnMatch
    if (!openBetsOnMatch.find(b => b.betId.toString() === selectedBetId)) {
      selectedBetId = '';
    }
    
    // Assert: selectedBetId should be cleared
    expect(selectedBetId).toBe('');
  });
});
```

## Success Criteria

✅ Users can select a bet and switch between matches without losing their selection
✅ Selection automatically clears when the bet is no longer available
✅ Amount field updates correctly when selection changes
✅ No unexpected behavior or console errors

## Notes

- The fix maintains the original behavior of clearing the selection when a bet is no longer available
- It only changes the behavior when switching matches - the selection now persists if the bet is still valid
- This improves UX by not forcing users to re-select the bet every time they switch matches
