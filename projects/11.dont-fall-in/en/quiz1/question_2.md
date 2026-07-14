
--- question ---

---
legend: Question 2 of 3
---

This is the code for a moving platform:

```blocks3
when I receive [start v]
forever
move [20] steps
if on edge, bounce
end
```

The game is too hard, and it's not fun to play. What could you do to make it easier to play?

--- choices ---

- (x) Change the number in the `move`{:class="block3motion"} block to a **smaller** number

  --- feedback ---

That's right. Making the number smaller will make the platform move a smaller number of steps each time the `forever`{:class="block3control"} loops runs so the platform will move more slowly. That makes it easier to jump on.

  --- /feedback ---

- ( ) Change the number in the `move`{:class="block3motion"} block to a **bigger** number

  --- feedback ---

Making the platform move more steps each time the `forever`{:class="block3control"} loop runs will make it move faster. That will make the platform harder to jump on.

  --- /feedback ---

--- /choices ---

--- /question ---
