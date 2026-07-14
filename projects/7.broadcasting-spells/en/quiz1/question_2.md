
--- question ---

---
legend: Question 2 of 3
---

A project uses this grow button.

![](images/grow-icon.png)

This code is used on the grow button:

```blocks3
when this sprite clicked
broadcast (grow v)
``` 

Two other sprites are also used in the project.

They are shown here with their code below each one:

![](images/Ripley-icon.png)

```blocks3
when I receive [grow v]
change size by [10]
``` 

![](images/Robot-icon.png)

```blocks3
when I receive [grow v]
change size by [10]
``` 

Which would change size when the grow button is clicked?

--- choices ---

- ( ) Whichever sprite receives the message first

 --- feedback ---

 No, messages are seen by all sprites. More than one sprite can respond to the same message.

 --- /feedback ---

- (x) Both the Ripley and Robot sprites

 --- feedback ---

 Yes, when a message is `broadcast`{:class="block3events"}, all sprites that have a `when I receive`{:class="block3events"} block will react to the message.

 --- /feedback ---

- ( ) Neither of the sprites

 --- feedback ---

 Have another look. The code does correctly `broadcast`{:class="block3events"} a message.

 --- /feedback ---

--- /choices ---

--- /question ---
