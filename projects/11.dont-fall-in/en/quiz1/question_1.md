## Quick quiz

Answer the three questions. There are hints to guide you to the correct answer.

When you have answered each question, click on **Check my answer**. 

Have fun!

--- question ---

---
legend: Question 1 of 3
---

![The Stage of a lava-jumping game. The character is on the end platform, a golden door.](images/quiz-lava-stage.png)

You win this game by reaching the golden door, and lose if you land in the lava pit. The game isn't working. How could you fix it?

```blocks3
when flag clicked
go to (Start v)
broadcast (start v)
```

```blocks3
when I receive [start v]
forever
if <touching color (#fff700) ?> then // check lose
broadcast (stop v) // stop other sprites
play sound (Lose v) until done
stop [all v]
end
if <touching color (#ff0000) ?> then // check win
broadcast (stop v) // stop other sprites
play sound (Win v) until done
stop [all v]
end
```


--- choices ---

- ( ) Change the colour in the 'check lose' condition

  --- feedback ---

Close. The 'check lose' condition doesn't have the right colour, but just changing that won't make the game work.

  --- /feedback ---

- ( ) Change the colour in the 'check win' condition

  --- feedback ---

Close. The 'check win' condition doesn't have the right colour, but just changing that won't make the game work.

  --- /feedback ---

- (x) Swap the colours in the 'check win' and 'check lose' conditions

  --- feedback ---

Yes. The 'check lose' and 'check win' conditions have the colours the wrong way round! The player will win when they fall in the lava and lose when they reach the golden door! Swapping the conditions will fix this.

  --- /feedback ---

--- /choices ---

--- /question ---
