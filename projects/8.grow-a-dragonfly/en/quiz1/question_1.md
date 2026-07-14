## Quick quiz

Answer the three questions. There are hints to guide you to the correct answer.

When you have answered each question, click on **Check my answer**. 

Have fun!

--- question ---
---
legend: Question 1 of 3
---

A project uses the **Crab** sprite and the **Jellyfish** sprite. The **Crab** sprite has this code:

![desc](images/crab-icon.png)

```blocks3
when flag clicked
if <not <touching color (#0000FF)?>> then
hide
end
```

What would need to happen for the **Crab** sprite to hide?

--- choices ---

- () The **Crab** sprite would need to touch the **Jellyfish**

 --- feedback ---

 No, the `if`{:class="block3control"} block has a `Sensing`{:class="block3sensing"} condition, but it does not use the `touching Jellyfish`{:class="block3sensing"} block.

 --- /feedback ---

- (x) The **Crab** sprite would need to not be touching the colour blue

 --- feedback ---

Yes, the `not`{:class="block3operators"} operator means that the condition is true `if`{:class="block3control"} the **Crab** sprite is not `touching`{:class="block3sensing"} the colour blue.

 --- /feedback ---

- () The **Crab** sprite would need to be touching the colour blue

 --- feedback ---

 Not quite, look closely at the `operator`{:class="block3operators"} in the condition. 

 --- /feedback ---

- ( ) The **Crab** sprite will always `hide`{:class="block3looks"} `when the flag is clicked`{:class="block3events"}

 --- feedback ---

 No, there is an `if`{:class="block3control"} block in the **Crab** sprite's code so it will only hide if the condition is met.

 --- /feedback ---

--- /choices ---

--- /question ---
